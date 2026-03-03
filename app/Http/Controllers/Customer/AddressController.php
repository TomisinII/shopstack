<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(): Response
    {
        $addresses = auth()->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($address) => [
                'id'              => $address->id,
                'type'            => $address->type,
                'full_name'       => $address->full_name,
                'phone'           => $address->phone,
                'address_line_1'  => $address->address_line_1,
                'address_line_2'  => $address->address_line_2,
                'city'            => $address->city,
                'state'           => $address->state,
                'zip_code'        => $address->zip_code,
                'country'         => $address->country,
                'is_default'      => $address->is_default,
            ]);

        return Inertia::render('Account/Addresses/Index', [
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type'           => 'required|in:shipping,billing,both',
            'full_name'      => 'required|string|max:255',
            'phone'          => 'required|string|max:50',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city'           => 'required|string|max:100',
            'state'          => 'required|string|max:100',
            'zip_code'       => 'required|string|max:20',
            'country'        => 'required|string|max:100',
            'is_default'     => 'boolean',
        ]);

        $user = auth()->user();

        // Clear existing default before setting a new one
        if (!empty($validated['is_default'])) {
            $user->addresses()->where('is_default', true)->update(['is_default' => false]);
        }

        // First address is always default
        if ($user->addresses()->doesntExist()) {
            $validated['is_default'] = true;
        }

        $user->addresses()->create($validated);

        return redirect()->route('account.addresses.index')
            ->with('success', 'Address added successfully.');
    }

    public function update(Request $request, Address $address): RedirectResponse
    {
        $this->authorizeAddress($address);

        $validated = $request->validate([
            'type'           => 'required|in:shipping,billing,both',
            'full_name'      => 'required|string|max:255',
            'phone'          => 'required|string|max:50',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city'           => 'required|string|max:100',
            'state'          => 'required|string|max:100',
            'zip_code'       => 'required|string|max:20',
            'country'        => 'required|string|max:100',
            'is_default'     => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            auth()->user()->addresses()->where('is_default', true)->update(['is_default' => false]);
        }

        $address->update($validated);

        return redirect()->route('account.addresses.index')
            ->with('success', 'Address updated successfully.');
    }

    public function destroy(Address $address): RedirectResponse
    {
        $this->authorizeAddress($address);

        $wasDefault = $address->is_default;
        $address->delete();

        // Promote the next address to default if the deleted one was default
        if ($wasDefault) {
            auth()->user()->addresses()->first()?->update(['is_default' => true]);
        }

        return redirect()->route('account.addresses.index')
            ->with('success', 'Address deleted.');
    }

    public function setDefault(Address $address): RedirectResponse
    {
        $this->authorizeAddress($address);

        auth()->user()->addresses()->where('is_default', true)->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return redirect()->route('account.addresses.index')
            ->with('success', 'Default address updated.');
    }

    /** Ensure the address belongs to the authenticated user. */
    private function authorizeAddress(Address $address): void
    {
        abort_unless($address->user_id === auth()->id(), 403);
    }
}