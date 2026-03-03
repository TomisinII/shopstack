<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $defaultNotifications = [
            'order_updates'           => true,
            'shipping_notifications'  => true,
            'promotional_emails'      => true,
            'product_recommendations' => true,
            'weekly_newsletter'       => true,
        ];

        $defaultPreferences = [
            'language' => 'en',
            'currency' => 'NGN',
            'theme'    => 'light',
        ];

        return Inertia::render('Account/Settings/Index', [
            'profile' => [
                'name'   => $user->name,
                'email'  => $user->email,
                'phone'  => $user->phone,
                'avatar' => $user->avatar,
            ],
            'notifications' => array_merge(
                $defaultNotifications,
                $user->notification_preferences ?? []
            ),
            'preferences' => array_merge(
                $defaultPreferences,
                $user->preferences ?? []
            ),
        ]);
    }

    /** Update profile (name, email, phone, avatar) */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone'      => 'nullable|string|max:50',
            'avatar'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $data = [
            'name'  => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ];

        if ($request->hasFile('avatar')) {
            // Remove old avatar
            if ($user->avatar) {
                Storage::disk('public')->delete(
                    ltrim(parse_url($user->avatar, PHP_URL_PATH), '/storage/')
                );
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = Storage::url($path);
        }

        $user->update($data);

        return back()->with('success', 'Profile updated successfully.');
    }

    /** Update password */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = Auth::user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'The current password is incorrect.']);
        }

        $user->update(['password' => $validated['password']]);

        return back()->with('success', 'Password updated successfully.');
    }

    /** Update notification preferences */
    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'order_updates'           => 'boolean',
            'shipping_notifications'  => 'boolean',
            'promotional_emails'      => 'boolean',
            'product_recommendations' => 'boolean',
            'weekly_newsletter'       => 'boolean',
        ]);

        Auth::user()->update(['notification_preferences' => $validated]);

        return back()->with('success', 'Notification preferences saved.');
    }

    /** Update preferences (language, currency, theme) */
    public function updatePreferences(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'language' => 'required|string|in:en,fr,es,de,ar',
            'currency' => 'required|string|in:NGN,USD,EUR,GBP',
            'theme'    => 'required|string|in:light,dark,auto',
        ]);

        Auth::user()->update(['preferences' => $validated]);

        return back()->with('success', 'Preferences saved.');
    }
}