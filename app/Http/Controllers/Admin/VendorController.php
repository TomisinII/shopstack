<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function index(Request $request): Response
    {
        $paginator = User::role('Vendor')
            ->with('profile')
            ->withCount('products')
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%")
                      ->orWhereHas('profile', fn ($q) =>
                          $q->where('store_name', 'like', "%{$request->search}%")
                      );
                });
            })
            ->when($request->filled('status'), fn ($q) =>
                $q->whereHas('profile', fn ($q) =>
                    $q->where('status', $request->status)
                )
            )
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $vendors = [
            'data' => $paginator->map(fn (User $user) => $this->formatVendor($user))->values(),
            'total' => $paginator->total(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'links' => $paginator->linkCollection()->toArray(),
        ];

        return Inertia::render('Admin/Vendors/Index', [
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(User $vendor): Response
    {
        abort_if(! $vendor->hasRole('Vendor'), 404);

        $vendor->load([
            'profile',
            'products.category',
            'products.images',
            'transactions' => fn ($q) => $q->latest()->limit(20),
        ]);

        // Aggregate earnings from completed order items for this vendor
        $earnings = \App\Models\Transaction::where('vendor_id', $vendor->id)
            ->selectRaw('
                COALESCE(SUM(CASE WHEN type = "earning" AND status = "completed" THEN net_amount ELSE 0 END), 0) as total_earned,
                COALESCE(SUM(CASE WHEN type = "payout"  AND status = "completed" THEN amount      ELSE 0 END), 0) as total_paid_out,
                COALESCE(SUM(CASE WHEN type = "earning" AND status = "pending"   THEN net_amount ELSE 0 END), 0) as pending_payout,
                COALESCE(SUM(CASE WHEN type = "commission"                        THEN amount      ELSE 0 END), 0) as total_commission
            ')
            ->first();

        $stats = [
            'total_products' => $vendor->products->count(),
            'published' => $vendor->products->where('status', 'published')->count(),
            'total_earned' => (float) $earnings->total_earned,
            'total_paid_out' => (float) $earnings->total_paid_out,
            'pending_payout' => (float) $earnings->pending_payout,
            'total_commission' => (float) $earnings->total_commission,
            'commission_rate' => (float) ($vendor->profile?->commission_rate ?? 15),
        ];

        return Inertia::render('Admin/Vendors/Show', [
            'vendor' => [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'email' => $vendor->email,
                'phone' => $vendor->phone,
                'created_at' => $vendor->created_at->toFormattedDateString(),
                'store_name' => $vendor->profile?->store_name,
                'store_slug' => $vendor->profile?->store_slug,
                'store_logo' => $vendor->profile?->store_logo,
                'store_banner' => $vendor->profile?->store_banner,
                'description' => $vendor->profile?->store_description,
                'address' => $vendor->profile?->address,
                'status' => $vendor->profile?->status ?? 'pending',
            ],
            'stats' => $stats,
            'products' => $vendor->products->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category?->name,
                'price' => (float) $p->price,
                'stock' => $p->stock_quantity,
                'stock_status' => $p->stock_status,
                'status' => $p->status,
                'image' => $p->getPrimaryImageUrl(),
            ]),
            'transactions' => $vendor->transactions->map(fn ($t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => (float) $t->amount,
                'net_amount' => (float) $t->net_amount,
                'status' => $t->status,
                'description' => $t->description,
                'created_at' => $t->created_at->toDateString(),
            ]),
        ]);
    }

    public function approve(User $vendor): RedirectResponse
    {
        abort_if(! $vendor->hasRole('Vendor'), 404);

        $vendor->profile()->update(['status' => 'approved']);

        return back()->with('success', "{$vendor->name}'s vendor account has been approved.");
    }

    public function suspend(User $vendor): RedirectResponse
    {
        abort_if(! $vendor->hasRole('Vendor'), 404);

        $vendor->profile()->update(['status' => 'suspended']);

        return back()->with('success', "{$vendor->name}'s vendor account has been suspended.");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatVendor(User $user): array
    {
        $profile = $user->profile;

        // Total sales = sum of net_amount on completed earnings for this vendor
        $sales = \App\Models\Transaction::where('vendor_id', $user->id)
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->sum('amount');

        $commission = \App\Models\Transaction::where('vendor_id', $user->id)
            ->where('type', 'commission')
            ->sum('amount');

        $payout = \App\Models\Transaction::where('vendor_id', $user->id)
            ->where('type', 'earning')
            ->where('status', 'pending')
            ->sum('net_amount');

        return [
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'store_name'   => $profile?->store_name ?? $user->name,
            'store_logo'   => $profile?->store_logo,
            'status'       => $profile?->status ?? 'pending',
            'products_count'=> $user->products_count,
            'total_sales'  => (float) $sales,
            'commission'   => (float) $commission,
            'payout'       => (float) $payout,
        ];
    }
}