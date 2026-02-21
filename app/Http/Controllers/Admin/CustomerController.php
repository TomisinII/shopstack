<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $paginator = User::role('Customer')
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->with(['orders' => fn ($q) => $q->latest()->limit(1)])
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%");
                });
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $request->status === 'active'
                    ? $q->whereHas('orders', fn ($q) => $q->where('created_at', '>=', now()->subDays(90)))
                    : $q->whereDoesntHave('orders', fn ($q) => $q->where('created_at', '>=', now()->subDays(90)));
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Build a flat pagination shape the frontend can destructure directly
        $customers = [
            'data' => $paginator->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'orders_count' => $user->orders_count,
                'total_spent' => (float) ($user->orders_sum_total ?? 0),
                'last_order_at' => optional($user->orders->first())->created_at?->toDateString(),
                'status' => $this->resolveStatus($user),
                'created_at' => $user->created_at->toDateString(),
            ])->values(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'links' => $paginator->linkCollection()->toArray(),
        ];

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters'   => $request->only(['search', 'status']),
        ]);
    }

    public function show(User $customer): Response
    {
        abort_if(! $customer->hasRole('Customer'), 404);

        $customer->load([
            'orders.items.product',
            'addresses',
            'reviews.product',
        ]);

        $stats = [
            'total_orders' => $customer->orders->count(),
            'total_spent' => (float) $customer->orders->sum('total'),
            'avg_order' => $customer->orders->count()
                ? round($customer->orders->sum('total') / $customer->orders->count(), 2)
                : 0,
            'last_order_at' => optional($customer->orders->sortByDesc('created_at')->first())->created_at?->toDateString(),
        ];

        return Inertia::render('Admin/Customers/Show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'avatar' => $customer->avatar,
                'phone' => $customer->phone,
                'created_at' => $customer->created_at->toFormattedDateString(),
                'status' => $this->resolveStatus($customer),
            ],
            'stats' => $stats,
            'orders' => $customer->orders->sortByDesc('created_at')->values()->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'total' => (float) $order->total,
                'items_count' => $order->items->count(),
                'created_at' => $order->created_at->toDateString(),
            ]),
            'addresses' => $customer->addresses->map(fn ($addr) => [
                'id' => $addr->id,
                'type' => $addr->type,
                'full_name' => $addr->full_name,
                'phone' => $addr->phone,
                'line1' => $addr->address_line_1,
                'line2' => $addr->address_line_2,
                'city' => $addr->city,
                'state' => $addr->state,
                'country' => $addr->country,
                'default' => $addr->is_default,
            ]),
            'reviews' => $customer->reviews->map(fn ($r) => [
                'id' => $r->id,
                'product_name' => optional($r->product)->name,
                'rating' => $r->rating,
                'title' => $r->title,
                'review' => $r->review,
                'is_approved' => $r->is_approved,
                'created_at' => $r->created_at->toDateString(),
            ]),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $customers = User::role('Customer')
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->get();

        return response()->streamDownload(function () use ($customers) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Name', 'Email', 'Orders', 'Total Spent', 'Joined']);
            foreach ($customers as $c) {
                fputcsv($out, [
                    $c->name,
                    $c->email,
                    $c->orders_count,
                    number_format($c->orders_sum_total ?? 0, 2),
                    $c->created_at->toDateString(),
                ]);
            }
            fclose($out);
        }, 'customers-' . now()->format('Y-m-d') . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function resolveStatus(User $user): string
    {
        // Active = placed an order in the last 90 days
        return $user->orders()
                    ->where('created_at', '>=', now()->subDays(90))
                    ->exists()
               ? 'active'
               : 'inactive';
    }
}