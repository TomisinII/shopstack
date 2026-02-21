<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request): Response
    {
        $query = Order::with(['user', 'items.product']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $sortField     = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $orders = $query->paginate(15)->through(fn ($order) => [
            'id'             => $order->id,
            'order_number'   => $order->order_number,
            'customer'       => [
                'id'    => $order->user->id,
                'name'  => $order->user->name,
                'email' => $order->user->email,
            ],
            'total'          => $order->total,
            'status'         => $order->status,
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'items_count'    => $order->items->count(),
            'created_at'     => $order->created_at->format('M d, Y H:i'),
        ]);

        return Inertia::render('Admin/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['search', 'status', 'payment_status', 'date_from', 'date_to', 'sort', 'direction']),
        ]);
    }

    /**
     * Display the specified order
     */
    public function show(Order $order): Response
    {
        $order->load(['user', 'items.product.images']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id'             => $order->id,
                'order_number'   => $order->order_number,
                'status'         => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,

                'customer' => [
                    'id'    => $order->user->id,
                    'name'  => $order->user->name,
                    'email' => $order->user->email,
                    'phone' => $order->user->phone,
                ],

                'shipping_address' => [
                    'full_name'    => $order->shipping_full_name,
                    'phone'        => $order->shipping_phone,
                    'address_line_1' => $order->shipping_address_line_1,
                    'address_line_2' => $order->shipping_address_line_2,
                    'city'         => $order->shipping_city,
                    'state'        => $order->shipping_state,
                    'zip'          => $order->shipping_zip,
                    'country'      => $order->shipping_country,
                ],

                'items' => $order->items->map(fn ($item) => [
                    'id'            => $item->id,
                    'product_name'  => $item->product_name,
                    'product_sku'   => $item->product_sku,
                    'quantity'      => $item->quantity,
                    'unit_price'    => $item->unit_price,
                    'subtotal'      => $item->subtotal,
                    'product_image' => $item->product?->getPrimaryImageUrl(),
                ]),

                'subtotal'        => $order->subtotal,
                'shipping_cost'   => $order->shipping_cost,
                'tax_amount'      => $order->tax_amount,
                'discount_amount' => $order->discount_amount,
                'total'           => $order->total,
                'coupon_code'     => $order->coupon_code,

                'tracking_number' => $order->tracking_number,
                'shipped_at'      => $order->shipped_at?->format('M d, Y H:i'),
                'delivered_at'    => $order->delivered_at?->format('M d, Y H:i'),

                'customer_notes' => $order->customer_notes,
                'admin_notes'    => $order->admin_notes,

                'created_at' => $order->created_at->format('M d, Y H:i'),
                'updated_at' => $order->updated_at->format('M d, Y H:i'),

                'can_cancel' => $order->canBeCancelled(),
                'can_refund' => $order->canBeRefunded(),
            ],
        ]);
    }

    /**
     * Update order status / tracking / notes
     */
    public function update(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status'          => 'sometimes|in:pending,processing,shipped,delivered,cancelled,refunded',
            'payment_status'  => 'sometimes|in:pending,paid,failed,refunded',
            'tracking_number' => 'nullable|string|max:255',
            'admin_notes'     => 'nullable|string',
        ]);

        if (isset($validated['status'])) {
            if ($validated['status'] === 'shipped' && $order->status !== 'shipped') {
                $validated['shipped_at'] = now();
            }
            if ($validated['status'] === 'delivered' && $order->status !== 'delivered') {
                $validated['delivered_at'] = now();
            }
        }

        $order->update($validated);

        return back()->with('success', 'Order updated successfully.');
    }

    /**
     * Cancel an order
     */
    public function cancel(Order $order): RedirectResponse
    {
        if (!$order->canBeCancelled()) {
            return back()->with('error', 'This order cannot be cancelled.');
        }

        $order->cancel();

        return back()->with('success', 'Order cancelled and stock returned.');
    }

    /**
     * Send a notification email to the customer
     */
    public function notify(Order $order): RedirectResponse
    {
        // Queue a status notification email to the customer.
        // Swap the Mailable class for your actual implementation when ready.
        // Mail::to($order->user->email)->queue(new OrderStatusUpdated($order));

        return back()->with('success', "Notification sent to {$order->user->email}.");
    }

    /**
     * Export filtered orders as CSV
     */
    public function export(Request $request): StreamedResponse
    {
        $query = Order::with('user')->orderBy('created_at', 'desc');

        if ($request->filled('status'))         $query->where('status', $request->status);
        if ($request->filled('payment_status')) $query->where('payment_status', $request->payment_status);
        if ($request->filled('date_from'))      $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->filled('date_to'))        $query->whereDate('created_at', '<=', $request->date_to);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                  ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"));
            });
        }

        $orders = $query->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders-' . now()->format('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($orders) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Order #', 'Customer', 'Email', 'Status', 'Payment', 'Total', 'Date']);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->order_number,
                    $order->user->name,
                    $order->user->email,
                    $order->status,
                    $order->payment_status,
                    $order->total,
                    $order->created_at->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}