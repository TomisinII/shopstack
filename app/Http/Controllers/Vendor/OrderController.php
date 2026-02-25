<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $vendorId = auth()->id();

        $query = Order::with(['user', 'items' => fn ($q) => $q->where('vendor_id', $vendorId)->with('product')])
            ->whereHas('items', fn ($q) => $q->where('vendor_id', $vendorId));

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")
                                                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->latest()->paginate(15)->through(fn ($order) => [
            'id'                 => $order->id,
            'order_number'       => $order->order_number,
            'status'             => $order->status,
            'payment_status'     => $order->payment_status,
            'total'              => $order->total,
            'currency'           => $order->currency,
            'created_at'         => $order->created_at->format('M d, Y'),
            'customer'           => [
                'name'  => $order->user->name,
                'email' => $order->user->email,
            ],
            'vendor_items_count' => $order->items->sum('quantity'),
            'vendor_subtotal'    => $order->items->sum('subtotal'),
        ]);

        return Inertia::render('Vendor/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['search', 'status', 'payment_status']),
            'stats'   => [
                'total'      => Order::whereHas('items', fn ($q) => $q->where('vendor_id', $vendorId))->count(),
                'pending'    => Order::whereHas('items', fn ($q) => $q->where('vendor_id', $vendorId))->where('status', 'pending')->count(),
                'processing' => Order::whereHas('items', fn ($q) => $q->where('vendor_id', $vendorId))->where('status', 'processing')->count(),
                'shipped'    => Order::whereHas('items', fn ($q) => $q->where('vendor_id', $vendorId))->where('status', 'shipped')->count(),
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $vendorId = auth()->id();

        abort_unless(
            $order->items()->where('vendor_id', $vendorId)->exists(),
            403
        );

        $order->load([
            'user',
            'items' => fn ($q) => $q->where('vendor_id', $vendorId)->with(['product.images', 'variant']),
        ]);

        return Inertia::render('Vendor/Orders/Show', [
            'order' => [
                'id'                      => $order->id,
                'order_number'            => $order->order_number,
                'status'                  => $order->status,
                'payment_status'          => $order->payment_status,
                'payment_method'          => $order->payment_method,
                'subtotal'                => $order->subtotal,
                'shipping_cost'           => $order->shipping_cost,
                'tax_amount'              => $order->tax_amount,
                'discount_amount'         => $order->discount_amount,
                'total'                   => $order->total,
                'currency'                => $order->currency,
                'tracking_number'         => $order->tracking_number,
                'customer_notes'          => $order->customer_notes,
                'shipped_at'              => $order->shipped_at?->format('M d, Y'),
                'delivered_at'            => $order->delivered_at?->format('M d, Y'),
                'created_at'              => $order->created_at->format('M d, Y · h:i A'),
                'shipping_full_name'      => $order->shipping_full_name,
                'shipping_phone'          => $order->shipping_phone,
                'shipping_address_line_1' => $order->shipping_address_line_1,
                'shipping_address_line_2' => $order->shipping_address_line_2,
                'shipping_city'           => $order->shipping_city,
                'shipping_state'          => $order->shipping_state,
                'shipping_zip'            => $order->shipping_zip,
                'shipping_country'        => $order->shipping_country,
                'customer' => [
                    'name'  => $order->user->name,
                    'email' => $order->user->email,
                ],
                'items' => $order->items->map(fn ($item) => [
                    'id'           => $item->id,
                    'product_name' => $item->product_name,
                    'product_sku'  => $item->product_sku,
                    'quantity'     => $item->quantity,
                    'unit_price'   => $item->unit_price,
                    'subtotal'     => $item->subtotal,
                    'variant_name' => $item->variant?->name,
                    'image'        => $item->product?->getPrimaryImageUrl(),
                ]),
                'vendor_subtotal' => $order->items->sum('subtotal'),
            ],
        ]);
    }

    /**
     * Update the order status — vendor can only mark as processing or shipped.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $vendorId = auth()->id();

        abort_unless(
            $order->items()->where('vendor_id', $vendorId)->exists(),
            403
        );

        $validated = $request->validate([
            'status'          => 'required|in:processing,shipped',
            'tracking_number' => 'nullable|string|max:255',
        ]);

        $updateData = ['status' => $validated['status']];

        if ($validated['status'] === 'shipped') {
            $updateData['tracking_number'] = $validated['tracking_number'] ?? $order->tracking_number;
            $updateData['shipped_at']      = now();
        }

        $order->update($updateData);

        return back()->with('success', 'Order status updated successfully.');
    }
}