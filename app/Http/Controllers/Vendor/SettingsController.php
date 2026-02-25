<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $profile = auth()->user()->profile;

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
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'store_name'        => 'required|string|max:255',
            'store_description' => 'nullable|string|max:1000',
            'phone'             => 'nullable|string|max:50',
            'address'           => 'nullable|string|max:500',
            'store_logo'        => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'store_banner'      => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $user    = auth()->user();
        $profile = $user->profile ?? $user->profile()->make();

        if (!$profile->store_slug) {
            $profile->store_slug = Str::slug($validated['store_name']);
        }

        if ($request->hasFile('store_logo')) {
            if ($profile->store_logo) {
                Storage::disk('public')->delete(ltrim(parse_url($profile->store_logo, PHP_URL_PATH), '/storage/'));
            }
            $path = $request->file('store_logo')->store('vendors/logos', 'public');
            $validated['store_logo'] = Storage::url($path);
        }

        if ($request->hasFile('store_banner')) {
            if ($profile->store_banner) {
                Storage::disk('public')->delete(ltrim(parse_url($profile->store_banner, PHP_URL_PATH), '/storage/'));
            }
            $path = $request->file('store_banner')->store('vendors/banners', 'public');
            $validated['store_banner'] = Storage::url($path);
        }

        $profile->fill($validated);
        $profile->user_id = $user->id;
        $profile->save();

        return back()->with('success', 'Store settings updated.');
    }
}