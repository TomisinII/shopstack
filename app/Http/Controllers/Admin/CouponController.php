<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    public function index(Request $request): Response
    {
        $coupons = Coupon::withCount('usages')
            ->when($request->filled('search'), fn ($q) =>
                $q->where('code', 'like', "%{$request->search}%")
            )
            ->when($request->filled('type'), fn ($q) =>
                $q->where('type', $request->type)
            )
            ->when($request->filled('status'), function ($q) use ($request) {
                $request->status === 'active'
                    ? $q->active()
                    : $q->where(function ($q) {
                        $q->where('is_active', false)
                          ->orWhere('valid_until', '<', now())
                          ->orWhereRaw('usage_limit IS NOT NULL AND used_count >= usage_limit');
                    });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => [
                'data'         => $coupons->map(fn (Coupon $c) => $this->formatCoupon($c))->values(),
                'total'        => $coupons->total(),
                'current_page' => $coupons->currentPage(),
                'last_page'    => $coupons->lastPage(),
                'from'         => $coupons->firstItem(),
                'to'           => $coupons->lastItem(),
                'links'        => $coupons->linkCollection()->toArray(),
            ],
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Coupons/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateCoupon($request);

        Coupon::create($data);

        return redirect()->route('admin.coupons.index')
                         ->with('success', "Coupon {$data['code']} created successfully.");
    }

    public function edit(Coupon $coupon): Response
    {
        return Inertia::render('Admin/Coupons/Edit', [
            'coupon' => $this->formatCoupon($coupon),
        ]);
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $data = $this->validateCoupon($request, $coupon);

        $coupon->update($data);

        return redirect()->route('admin.coupons.index')
                         ->with('success', "Coupon {$coupon->code} updated successfully.");
    }

    public function duplicate(Coupon $coupon): RedirectResponse
    {
        $new = $coupon->replicate();
        $new->code       = strtoupper(Str::random(8));
        $new->used_count = 0;
        $new->save();

        return redirect()->route('admin.coupons.edit', $new->id)
                         ->with('success', "Coupon duplicated as {$new->code}. Edit and save to finalise.");
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $code = $coupon->code;
        $coupon->delete();

        return back()->with('success', "Coupon {$code} deleted.");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatCoupon(Coupon $c): array
    {
        $expired = $c->valid_until && now()->gt($c->valid_until);
        $maxedOut = $c->usage_limit && $c->used_count >= $c->usage_limit;

        return [
            'id'                    => $c->id,
            'code'                  => $c->code,
            'type'                  => $c->type,
            'value'                 => (float) $c->value,
            'minimum_order_amount'  => $c->minimum_order_amount ? (float) $c->minimum_order_amount : null,
            'maximum_discount'      => $c->maximum_discount ? (float) $c->maximum_discount : null,
            'usage_limit'           => $c->usage_limit,
            'usage_limit_per_user'  => $c->usage_limit_per_user,
            'used_count'            => $c->used_count,
            'valid_from'            => $c->valid_from?->format('Y-m-d'),
            'valid_until'           => $c->valid_until?->format('Y-m-d'),
            'valid_until_display'   => $c->valid_until?->format('d/m/Y'),
            'is_active'             => $c->is_active,
            'applies_to'            => $c->applies_to,
            'excludes'              => $c->excludes,
            'status'                => ! $c->is_active ? 'inactive' : ($expired || $maxedOut ? 'expired' : 'active'),
        ];
    }

    private function validateCoupon(Request $request, ?Coupon $coupon = null): array
    {
        return $request->validate([
            'code'                   => 'required|string|max:50|unique:coupons,code' . ($coupon ? ",{$coupon->id}" : ''),
            'type'                   => 'required|in:percentage,fixed,free_shipping',
            'value'                  => 'required|numeric|min:0',
            'minimum_order_amount'   => 'nullable|numeric|min:0',
            'maximum_discount'       => 'nullable|numeric|min:0',
            'usage_limit'            => 'nullable|integer|min:1',
            'usage_limit_per_user'   => 'nullable|integer|min:1',
            'valid_from'             => 'nullable|date',
            'valid_until'            => 'nullable|date|after_or_equal:valid_from',
            'is_active'              => 'boolean',
        ]);
    }
}