<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display admin dashboard with statistics
     */
    public function index(): Response
    {
        // Get date ranges
        $today = now()->startOfDay();
        $yesterday = now()->subDay()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $lastWeek = now()->subWeek()->startOfWeek();
        $thisMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        // Sales stats with trends
        $todaySales = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $today)
            ->sum('total');

        $yesterdaySales = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$yesterday, $today])
            ->sum('total');

        $weekSales = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $thisWeek)
            ->sum('total');

        $monthSales = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $thisMonth)
            ->sum('total');

        $lastMonthSales = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$lastMonth, $thisMonth])
            ->sum('total');

        // Calculate sales trend (today vs yesterday)
        $salesTrend = $yesterdaySales > 0 
            ? round((($todaySales - $yesterdaySales) / $yesterdaySales) * 100)
            : ($todaySales > 0 ? 100 : 0);

        // Order stats with trends
        $todayOrders = Order::where('created_at', '>=', $today)->count();
        $yesterdayOrders = Order::whereBetween('created_at', [$yesterday, $today])->count();
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $processingOrders = Order::where('status', 'processing')->count();

        // Calculate orders trend (today vs yesterday)
        $ordersTrend = $yesterdayOrders > 0
            ? round((($todayOrders - $yesterdayOrders) / $yesterdayOrders) * 100)
            : ($todayOrders > 0 ? 100 : 0);

        // Product stats
        $totalProducts = Product::count();
        $publishedProducts = Product::where('status', 'published')->count();
        $lowStockProducts = Product::where('track_inventory', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('stock_quantity', '>', 0)
            ->count();
        $outOfStockProducts = Product::where('stock_status', 'out_of_stock')
            ->orWhere(function($q) {
                $q->where('track_inventory', true)
                  ->where('stock_quantity', '<=', 0);
            })
            ->count();

        // Customer stats with trends
        $totalCustomers = User::role('Customer')->count();
        $newCustomersThisMonth = User::role('Customer')
            ->where('created_at', '>=', $thisMonth)
            ->count();
        $newCustomersLastMonth = User::role('Customer')
            ->whereBetween('created_at', [$lastMonth, $thisMonth])
            ->count();

        // Calculate customer trend (this month vs last month)
        $customersTrend = $newCustomersLastMonth > 0
            ? round((($newCustomersThisMonth - $newCustomersLastMonth) / $newCustomersLastMonth) * 100)
            : ($newCustomersThisMonth > 0 ? 100 : 0);

        // Calculate revenue trend (this month vs last month)
        $revenueTrend = $lastMonthSales > 0
            ? round((($monthSales - $lastMonthSales) / $lastMonthSales) * 100)
            : ($monthSales > 0 ? 100 : 0);

        // Recent orders (last 5)
        $recentOrders = Order::with(['user'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->user->name,
                    'customer_email' => $order->user->email,
                    'total' => $order->total,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->format('M d, Y H:i'),
                ];
            });

        // Top selling products (with revenue)
        $topProductsData = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->select('order_items.product_id')
            ->selectRaw('SUM(order_items.quantity) as sales_count')
            ->selectRaw('SUM(order_items.subtotal) as total_revenue')
            ->groupBy('order_items.product_id')
            ->orderByDesc('total_revenue')
            ->take(5)
            ->get();

        // Get the actual product details
        $topProducts = collect();
        foreach ($topProductsData as $item) {
            $product = Product::with('images')->find($item->product_id);
            if ($product) {
                $topProducts->push([
                    'id' => $product->id,
                    'name' => $product->name,
                    'image' => $product->getPrimaryImageUrl(),
                    'price' => $product->price,
                    'sales_count' => (int) $item->sales_count,
                    'total_revenue' => (float) $item->total_revenue,
                ]);
            }
        }

        // Low stock products
        $lowStockProductsList = Product::where('track_inventory', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('stock_quantity', '>', 0)
            ->with('images')
            ->orderBy('stock_quantity', 'asc')
            ->take(3)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'image' => $product->getPrimaryImageUrl(),
                    'stock_quantity' => $product->stock_quantity,
                    'low_stock_threshold' => $product->low_stock_threshold,
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'sales' => [
                    'today' => (float) $todaySales,
                    'week' => (float) $weekSales,
                    'month' => (float) $monthSales,
                    'trend' => $salesTrend,
                ],
                'orders' => [
                    'today' => $todayOrders,
                    'all_time' => $totalOrders,
                    'pending' => $pendingOrders,
                    'processing' => $processingOrders,
                    'trend' => $ordersTrend,
                ],
                'products' => [
                    'total' => $totalProducts,
                    'published' => $publishedProducts,
                    'low_stock' => $lowStockProducts,
                    'out_of_stock' => $outOfStockProducts,
                ],
                'customers' => [
                    'total' => $totalCustomers,
                    'new_this_month' => $newCustomersThisMonth,
                    'trend' => $customersTrend,
                ],
                'revenue' => [
                    'month' => (float) $monthSales,
                    'trend' => $revenueTrend,
                ],
            ],
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'lowStockProducts' => $lowStockProductsList,
        ]);
    }
}