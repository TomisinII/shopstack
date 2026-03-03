<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $totalOrders = $user->orders()->count();

        $totalSpent = $user->orders()
            ->where('payment_status', 'paid')
            ->sum('total');

        $wishlistCount = $user->wishlists()->count();

        // 1 loyalty point per ₦100 spent
        $loyaltyPoints = (int) floor($totalSpent / 100);

        $recentOrders = $user->orders()
            ->with(['items.product.images'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($order) => [
                'id'             => $order->id,
                'order_number'   => $order->order_number,
                'status'         => $order->status,
                'payment_status' => $order->payment_status,
                'total'          => (float) $order->total,
                'items_count'    => $order->items->sum('quantity'),
                'created_at'     => $order->created_at->format('M d, Y'),
                'thumbnail'      => $order->items->first()?->product?->getPrimaryImageUrl(),
            ]);

        $ordersByStatus = $user->orders()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Account/Dashboard', [
            'stats' => [
                'total_orders'   => $totalOrders,
                'total_spent'    => (float) $totalSpent,
                'wishlist_count' => $wishlistCount,
                'loyalty_points' => $loyaltyPoints,
            ],
            'recent_orders'    => $recentOrders,
            'orders_breakdown' => $ordersByStatus,
        ]);
    }
}