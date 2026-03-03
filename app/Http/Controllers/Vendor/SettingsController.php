<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $user    = auth()->user();
        $profile = $user->profile;

        return Inertia::render('Vendor/Settings/Index', [
            'profile' => $profile ? [
                'store_name'        => $profile->store_name,
                'store_slug'        => $profile->store_slug,
                'store_description' => $profile->store_description,
                'store_logo'        => $profile->store_logo,
                'store_banner'      => $profile->store_banner,
                'phone'             => $profile->phone,
                'address'           => $profile->address,
                'commission_rate'   => $profile->commission_rate,
                'status'            => $profile->status,
            ] : null,
            'user' => [
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'store_name'        => 'required|string|max:255',
            'store_slug'        => 'nullable|string|max:255|unique:profiles,store_slug,' . $user->profile?->id,
            'store_description' => 'nullable|string|max:1000',
            'phone'             => 'nullable|string|max:50',
            'address'           => 'nullable|string|max:500',
            'store_logo'        => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'store_banner'      => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            // Payout fields stored on profile as JSON or flat — kept as plain strings
            'bank_name'         => 'nullable|string|max:100',
            'account_number'    => 'nullable|string|max:50',
            'routing_number'    => 'nullable|string|max:50',
        ]);

        $profileData = [
            'store_name'        => $validated['store_name'],
            'store_slug'        => $validated['store_slug']
                                    ?? Str::slug($validated['store_name']),
            'store_description' => $validated['store_description'],
            'phone'             => $validated['phone'],
            'address'           => $validated['address'],
        ];

        // Handle logo upload
        if ($request->hasFile('store_logo')) {
            if ($user->profile?->store_logo) {
                Storage::disk('public')->delete(
                    ltrim(parse_url($user->profile->store_logo, PHP_URL_PATH), '/storage/')
                );
            }
            $path = $request->file('store_logo')->store('vendors/logos', 'public');
            $profileData['store_logo'] = Storage::url($path);
        }

        // Handle banner upload
        if ($request->hasFile('store_banner')) {
            if ($user->profile?->store_banner) {
                Storage::disk('public')->delete(
                    ltrim(parse_url($user->profile->store_banner, PHP_URL_PATH), '/storage/')
                );
            }
            $path = $request->file('store_banner')->store('vendors/banners', 'public');
            $profileData['store_banner'] = Storage::url($path);
        }

        // Merge payout info into profile address field as structured JSON
        $payoutData = array_filter([
            'bank_name'      => $validated['bank_name']      ?? null,
            'account_number' => $validated['account_number'] ?? null,
            'routing_number' => $validated['routing_number'] ?? null,
        ]);

        if (!empty($payoutData)) {
            // Preserve existing payout data and merge
            $existing   = json_decode($user->profile?->payout_info ?? '{}', true) ?? [];
            $profileData['payout_info'] = json_encode(array_merge($existing, $payoutData));
        }

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return back()->with('success', 'Store settings saved successfully.');
    }
}