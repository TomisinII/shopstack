<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $vendorId = auth()->id();
        $user     = auth()->user();
        $profile  = $user->profile;

        $totalProducts = Product::where('user_id', $vendorId)->count();

        $productsThisMonth = Product::where('user_id', $vendorId)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $totalOrders = Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendorId))->count();

        $ordersThisWeek = Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendorId))
            ->where('created_at', '>=', now()->startOfWeek())
            ->count();

        $totalRevenue = OrderItem::where('vendor_id', $vendorId)
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid'))
            ->sum('subtotal');

        // Month-over-month revenue growth percentage
        $revenueLastMonth = OrderItem::where('vendor_id', $vendorId)
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid')
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year))
            ->sum('subtotal');

        $revenueThisMonth = OrderItem::where('vendor_id', $vendorId)
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year))
            ->sum('subtotal');

        $revenueGrowth = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : null;

        $pendingPayout = Transaction::where('vendor_id', $vendorId)
            ->where('type', 'earning')
            ->where('status', 'pending')
            ->sum('net_amount');

        // ── Recent Orders — with first vendor item name per order ─────
        $recentOrders = Order::with([
                'user:id,name',
                'items' => fn($q) => $q->where('vendor_id', $vendorId)->limit(1),
            ])
            ->whereHas('items', fn($q) => $q->where('vendor_id', $vendorId))
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn($order) => [
                'id'           => $order->id,
                'order_number' => $order->order_number,
                'customer'     => $order->user->name,
                'product'      => $order->items->first()?->product_name ?? '—',
                'amount'       => (float) $order->items->sum('subtotal'),
                'status'       => $order->status,
                'created_at'   => $order->created_at->format('M d, Y'),
            ]);

        // ── Store Performance metrics ──────────────────────────────────
        $storeRating = Review::whereHas('product', fn($q) => $q->where('user_id', $vendorId))
            ->where('is_approved', true)
            ->avg('rating') ?? 0;

        $storeViews = (int) Product::where('user_id', $vendorId)->sum('views_count');

        // Average of vendor-specific subtotals per order
        $allVendorOrders = Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendorId))
            ->where('payment_status', 'paid')
            ->with(['items' => fn($q) => $q->where('vendor_id', $vendorId)])
            ->get();

        $avgOrderValue = $allVendorOrders->count() > 0
            ? $allVendorOrders->avg(fn($o) => $o->items->sum('subtotal'))
            : 0;

        $conversionRate = $storeViews > 0
            ? round(($totalOrders / $storeViews) * 100, 1)
            : 0;

        return Inertia::render('Vendor/Dashboard', [
            'storeName' => $profile?->store_name ?? $user->name,
            'stats' => [
                'total_products'      => $totalProducts,
                'products_this_month' => $productsThisMonth,
                'total_orders'        => $totalOrders,
                'orders_this_week'    => $ordersThisWeek,
                'total_revenue'       => (float) $totalRevenue,
                'revenue_growth'      => $revenueGrowth,
                'pending_payout'      => (float) $pendingPayout,
                'next_payout_date'    => now()->addMonth()->startOfMonth()->format('M d'),
            ],
            'recentOrders' => $recentOrders,
            'performance'  => [
                'store_rating'    => round((float) $storeRating, 1),
                'store_views'     => $storeViews,
                'conversion_rate' => $conversionRate,
                'avg_order_value' => (float) $avgOrderValue,
            ],
        ]);
    }
}