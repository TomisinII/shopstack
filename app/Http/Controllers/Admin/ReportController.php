<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Reports hub — renders the landing page with all 6 report cards.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Reports/Index');
    }

    /**
     * Sales report — revenue, orders, trends.
     */
    public function sales(Request $request): Response
    {
        $range  = $request->get('range', '30');   // days
        $from   = now()->subDays((int) $range)->startOfDay();
        $to     = now()->endOfDay();

        // Daily revenue series
        $dailySales = Order::paid()
            ->whereBetween('created_at', [$from, $to])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date'    => $row->date,
                'revenue' => (float) $row->revenue,
                'orders'  => (int) $row->orders,
            ]);

        // Summary cards
        $summary = Order::paid()->whereBetween('created_at', [$from, $to]);

        $stats = [
            'total_revenue'     => (float) (clone $summary)->sum('total'),
            'total_orders'      => (clone $summary)->count(),
            'average_order'     => (float) ((clone $summary)->avg('total') ?? 0),
            'total_discount'    => (float) (clone $summary)->sum('discount_amount'),
        ];

        // Revenue by payment method
        $byPayment = Order::paid()
            ->whereBetween('created_at', [$from, $to])
            ->select('payment_method', DB::raw('SUM(total) as revenue'), DB::raw('COUNT(*) as orders'))
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($r) => [
                'method'  => $r->payment_method,
                'revenue' => (float) $r->revenue,
                'orders'  => (int) $r->orders,
            ]);

        return Inertia::render('Admin/Reports/Sales', [
            'dailySales' => $dailySales,
            'stats'      => $stats,
            'byPayment'  => $byPayment,
            'range'      => $range,
        ]);
    }

    /**
     * Products report — best sellers, worst performers, low stock.
     */
    public function products(Request $request): Response
    {
        $range = $request->get('range', '30');
        $from  = now()->subDays((int) $range)->startOfDay();

        // Best sellers by units sold
        $bestSellers = OrderItem::select('product_id', 'product_name',
                DB::raw('SUM(quantity) as units_sold'),
                DB::raw('SUM(subtotal) as revenue')
            )
            ->whereHas('order', fn ($q) => $q->paid()->where('created_at', '>=', $from))
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('units_sold')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $product = Product::with('images')->find($item->product_id);
                return [
                    'product_id'   => $item->product_id,
                    'product_name' => $item->product_name,
                    'units_sold'   => (int) $item->units_sold,
                    'revenue'      => (float) $item->revenue,
                    'image'        => $product?->getPrimaryImageUrl(),
                ];
            });

        // Worst performers (published products with fewest/no sales in range)
        $soldIds = OrderItem::select('product_id')
            ->whereHas('order', fn ($q) => $q->paid()->where('created_at', '>=', $from))
            ->pluck('product_id');

        $worstPerformers = Product::published()
            ->whereNotIn('id', $soldIds)
            ->withCount('orderItems')
            ->orderBy('order_items_count')
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'product_id'   => $p->id,
                'product_name' => $p->name,
                'units_sold'   => 0,
                'revenue'      => 0,
                'image'        => $p->getPrimaryImageUrl(),
            ]);

        // Low stock
        $lowStock = Product::published()
            ->where('track_inventory', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->orderBy('stock_quantity')
            ->limit(20)
            ->get()
            ->map(fn ($p) => [
                'id'              => $p->id,
                'name'            => $p->name,
                'sku'             => $p->sku,
                'stock_quantity'  => $p->stock_quantity,
                'stock_status'    => $p->stock_status,
                'threshold'       => $p->low_stock_threshold,
                'image'           => $p->getPrimaryImageUrl(),
            ]);

        // Revenue by category
        $byCategory = OrderItem::select(
                DB::raw('categories.name as category'),
                DB::raw('SUM(order_items.subtotal) as revenue'),
                DB::raw('SUM(order_items.quantity) as units')
            )
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereHas('order', fn ($q) => $q->paid()->where('order_items.created_at', '>=', $from))
            ->groupBy('categories.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                'category' => $r->category,
                'revenue'  => (float) $r->revenue,
                'units'    => (int) $r->units,
            ]);

        return Inertia::render('Admin/Reports/Products', [
            'bestSellers'     => $bestSellers,
            'worstPerformers' => $worstPerformers,
            'lowStock'        => $lowStock,
            'byCategory'      => $byCategory,
            'range'           => $range,
        ]);
    }

    /**
     * Customers report — new customers, top spenders, retention.
     */
    public function customers(Request $request): Response
    {
        $range = $request->get('range', '30');
        $from  = now()->subDays((int) $range)->startOfDay();

        // New customers in range
        $newCustomers = User::role('Customer')
            ->whereBetween('created_at', [$from, now()])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => ['date' => $r->date, 'count' => (int) $r->count]);

        // Top customers by lifetime value
        $topCustomers = Order::paid()
            ->select('user_id',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total) as lifetime_value')
            )
            ->with('user:id,name,email,created_at')
            ->groupBy('user_id')
            ->orderByDesc('lifetime_value')
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'user_id'        => $o->user_id,
                'name'           => $o->user?->name ?? 'Deleted User',
                'email'          => $o->user?->email ?? '—',
                'order_count'    => (int) $o->order_count,
                'lifetime_value' => (float) $o->lifetime_value,
                'member_since'   => $o->user?->created_at?->format('M Y'),
            ]);

        $stats = [
            'new_customers'   => User::role('Customer')->whereBetween('created_at', [$from, now()])->count(),
            'total_customers' => User::role('Customer')->count(),
            'avg_order_value' => (float) (Order::paid()->whereBetween('created_at', [$from, now()])->avg('total') ?? 0),
            'repeat_buyers'   => Order::paid()
                ->whereBetween('created_at', [$from, now()])
                ->select('user_id')
                ->groupBy('user_id')
                ->havingRaw('COUNT(*) > 1')
                ->get()->count(),
        ];

        return Inertia::render('Admin/Reports/Customers', [
            'newCustomers' => $newCustomers,
            'topCustomers' => $topCustomers,
            'stats'        => $stats,
            'range'        => $range,
        ]);
    }

    /**
     * Vendors report — top vendors, commission totals, payouts.
     */
    public function vendors(Request $request): Response
    {
        $range = $request->get('range', '30');
        $from  = now()->subDays((int) $range)->startOfDay();

        $topVendors = Transaction::where('type', 'earning')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$from, now()])
            ->select('vendor_id',
                DB::raw('SUM(amount) as gross'),
                DB::raw('SUM(commission_amount) as commission'),
                DB::raw('SUM(net_amount) as net'),
                DB::raw('COUNT(*) as sales')
            )
            ->with('vendor:id,name,email')
            ->groupBy('vendor_id')
            ->orderByDesc('gross')
            ->get()
            ->map(fn ($t) => [
                'vendor_id'  => $t->vendor_id,
                'name'       => $t->vendor?->name ?? 'Deleted Vendor',
                'email'      => $t->vendor?->email ?? '—',
                'gross'      => (float) $t->gross,
                'commission' => (float) $t->commission,
                'net'        => (float) $t->net,
                'sales'      => (int) $t->sales,
            ]);

        $stats = [
            'total_gross'      => (float) Transaction::where('type', 'earning')->where('status', 'completed')->whereBetween('created_at', [$from, now()])->sum('amount'),
            'total_commission' => (float) Transaction::where('type', 'earning')->where('status', 'completed')->whereBetween('created_at', [$from, now()])->sum('commission_amount'),
            'total_payouts'    => (float) Transaction::where('type', 'payout')->where('status', 'completed')->whereBetween('created_at', [$from, now()])->sum('amount'),
            'pending_payouts'  => (float) Transaction::where('type', 'payout')->where('status', 'pending')->sum('amount'),
        ];

        return Inertia::render('Admin/Reports/Vendors', [
            'topVendors' => $topVendors,
            'stats'      => $stats,
            'range'      => $range,
        ]);
    }

    /**
     * Tax report — tax collected grouped by location and date.
     */
    public function tax(Request $request): Response
    {
        $range = $request->get('range', '30');
        $from  = now()->subDays((int) $range)->startOfDay();

        $byDate = Order::paid()
            ->whereBetween('created_at', [$from, now()])
            ->where('tax_amount', '>', 0)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(tax_amount) as tax'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date'    => $r->date,
                'tax'     => (float) $r->tax,
                'revenue' => (float) $r->revenue,
                'orders'  => (int) $r->orders,
            ]);

        $byState = Order::paid()
            ->whereBetween('created_at', [$from, now()])
            ->where('tax_amount', '>', 0)
            ->select('shipping_state',
                DB::raw('SUM(tax_amount) as tax'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('shipping_state')
            ->orderByDesc('tax')
            ->get()
            ->map(fn ($r) => [
                'state'  => $r->shipping_state,
                'tax'    => (float) $r->tax,
                'orders' => (int) $r->orders,
            ]);

        $stats = [
            'total_tax'    => (float) Order::paid()->whereBetween('created_at', [$from, now()])->sum('tax_amount'),
            'taxed_orders' => Order::paid()->whereBetween('created_at', [$from, now()])->where('tax_amount', '>', 0)->count(),
            'avg_tax_rate' => (float) Order::paid()->whereBetween('created_at', [$from, now()])->where('total', '>', 0)->avg(DB::raw('tax_amount / total * 100')),
        ];

        return Inertia::render('Admin/Reports/Tax', [
            'byDate'  => $byDate,
            'byState' => $byState,
            'stats'   => $stats,
            'range'   => $range,
        ]);
    }

    /**
     * Coupon report — redemption rates, discount totals.
     */
    public function coupons(Request $request): Response
    {
        $range = $request->get('range', '30');
        $from  = now()->subDays((int) $range)->startOfDay();

        $couponStats = Coupon::withCount([
                'usages as uses_in_range' => fn ($q) => $q->whereBetween('coupon_usages.created_at', [$from, now()]),
            ])
            ->addSelect([
                'discount_given' => CouponUsage::selectRaw('COALESCE(SUM(orders.discount_amount), 0)')
                    ->join('orders', 'coupon_usages.order_id', '=', 'orders.id')
                    ->whereColumn('coupon_usages.coupon_id', 'coupons.id')
                    ->whereBetween('coupon_usages.created_at', [$from, now()]),
            ])
            ->having('uses_in_range', '>', 0)
            ->orderByDesc('uses_in_range')
            ->get()
            ->map(fn ($c) => [
                'id'             => $c->id,
                'code'           => $c->code,
                'type'           => $c->type,
                'value'          => (float) $c->value,
                'used_count'     => $c->used_count,
                'uses_in_range'  => (int) $c->uses_in_range,
                'usage_limit'    => $c->usage_limit,
                'discount_given' => (float) ($c->discount_given ?? 0),
                'is_active'      => $c->is_active,
                'valid_until'    => $c->valid_until?->format('M d, Y'),
            ]);

        // Discount totals from orders
        $discountByDay = Order::paid()
            ->whereBetween('created_at', [$from, now()])
            ->whereNotNull('coupon_code')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(discount_amount) as discount'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date'     => $r->date,
                'discount' => (float) $r->discount,
                'orders'   => (int) $r->orders,
            ]);

        $stats = [
            'total_discount'   => (float) Order::paid()->whereBetween('created_at', [$from, now()])->sum('discount_amount'),
            'coupon_orders'    => Order::paid()->whereBetween('created_at', [$from, now()])->whereNotNull('coupon_code')->count(),
            'active_coupons'   => Coupon::active()->count(),
            'total_redemptions'=> CouponUsage::whereBetween('created_at', [$from, now()])->count(),
        ];

        return Inertia::render('Admin/Reports/Coupons', [
            'couponStats'    => $couponStats,
            'discountByDay'  => $discountByDay,
            'stats'          => $stats,
            'range'          => $range,
        ]);
    }
}