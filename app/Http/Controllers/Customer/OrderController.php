<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Auth::user()->orders()
            ->with(['items.product.images'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->paginate(10)->through(fn ($order) => [
            'id'             => $order->id,
            'order_number'   => $order->order_number,
            'status'         => $order->status,
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'subtotal'       => (float) $order->subtotal,
            'shipping_cost'  => (float) $order->shipping_cost,
            'discount_amount'=> (float) $order->discount_amount,
            'total'          => (float) $order->total,
            'items_count'    => $order->items->sum('quantity'),
            'created_at'     => $order->created_at->format('M d, Y'),
            'items'          => $order->items->take(3)->map(fn ($item) => [
                'id'           => $item->id,
                'product_name' => $item->product_name,
                'quantity'     => $item->quantity,
                'unit_price'   => (float) $item->unit_price,
                'thumbnail'    => $item->product?->getPrimaryImageUrl(),
                'product_id'   => $item->product_id,
                'variant_id'   => $item->product_variant_id,
            ]),
            'extra_items_count' => max(0, $order->items->count() - 3),
        ]);

        return Inertia::render('Account/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'payment_status']),
        ]);
    }

    public function show(Order $order): Response
    {
        // Ensure customer owns this order
        abort_unless($order->user_id === Auth::id(), 403);

        $order->load(['items.product.images', 'items.variant']);

        return Inertia::render('Account/Orders/Show', [
            'order' => [
                'id'                      => $order->id,
                'order_number'            => $order->order_number,
                'status'                  => $order->status,
                'payment_status'          => $order->payment_status,
                'payment_method'          => $order->payment_method,
                'subtotal'                => (float) $order->subtotal,
                'shipping_cost'           => (float) $order->shipping_cost,
                'tax_amount'              => (float) $order->tax_amount,
                'discount_amount'         => (float) $order->discount_amount,
                'total'                   => (float) $order->total,
                'coupon_code'             => $order->coupon_code,
                'tracking_number'         => $order->tracking_number,
                'customer_notes'          => $order->customer_notes,
                'can_be_cancelled'        => $order->canBeCancelled(),
                'can_be_refunded'         => $order->canBeRefunded(),
                'shipped_at'              => $order->shipped_at?->format('M d, Y'),
                'delivered_at'            => $order->delivered_at?->format('M d, Y'),
                'created_at'              => $order->created_at->format('M d, Y · h:i A'),
                // Shipping address
                'shipping_full_name'      => $order->shipping_full_name,
                'shipping_phone'          => $order->shipping_phone,
                'shipping_address_line_1' => $order->shipping_address_line_1,
                'shipping_address_line_2' => $order->shipping_address_line_2,
                'shipping_city'           => $order->shipping_city,
                'shipping_state'          => $order->shipping_state,
                'shipping_zip'            => $order->shipping_zip,
                'shipping_country'        => $order->shipping_country,
                // Billing address
                'billing_full_name'       => $order->billing_full_name,
                'billing_address_line_1'  => $order->billing_address_line_1,
                'billing_city'            => $order->billing_city,
                'billing_state'           => $order->billing_state,
                'billing_zip'             => $order->billing_zip,
                'billing_country'         => $order->billing_country,
                'items' => $order->items->map(fn ($item) => [
                    'id'           => $item->id,
                    'product_id'   => $item->product_id,
                    'variant_id'   => $item->product_variant_id,
                    'product_name' => $item->product_name,
                    'product_sku'  => $item->product_sku,
                    'quantity'     => $item->quantity,
                    'unit_price'   => (float) $item->unit_price,
                    'subtotal'     => (float) $item->subtotal,
                    'thumbnail'    => $item->product?->getPrimaryImageUrl(),
                    'product_slug' => $item->product?->slug,
                    'variant_name' => $item->variant?->name,
                ]),
            ],
        ]);
    }

    /**
     * Re-add all items from a previous order into the cart
     */
    public function buyAgain(Order $order): RedirectResponse
    {
        abort_unless($order->user_id === Auth::id(), 403);

        $order->load(['items.product', 'items.variant']);

        $cart = Auth::user()->getOrCreateCart();

        foreach ($order->items as $item) {
            // Skip if product no longer exists or is not published
            if (! $item->product || $item->product->status !== 'published') {
                continue;
            }

            $cart->addItem($item->product, $item->quantity, $item->variant ?? null);
        }

        return redirect()->route('cart.index')
            ->with('success', 'Items from order ' . $order->order_number . ' added to your cart.');
    }
}