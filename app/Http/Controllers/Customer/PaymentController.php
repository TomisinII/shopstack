<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\StripeClient;

class PaymentController extends Controller
{
    private function stripe(): StripeClient
    {
        $secret = config('services.stripe.secret');

        abort_if(
            blank($secret),
            503,
            'Stripe is not configured. Please add STRIPE_SECRET to your .env file.'
        );

        return new StripeClient($secret);
    }

    public function index(): Response
    {
        $user = Auth::user();

        $paymentMethods = [];

        if ($user->stripe_customer_id) {
            $methods = $this->stripe()->paymentMethods->all([
                'customer' => $user->stripe_customer_id,
                'type'     => 'card',
            ]);

            $paymentMethods = collect($methods->data)->map(fn ($pm) => [
                'id'         => $pm->id,
                'brand'      => ucfirst($pm->card->brand),
                'last4'      => $pm->card->last4,
                'exp_month'  => str_pad($pm->card->exp_month, 2, '0', STR_PAD_LEFT),
                'exp_year'   => substr($pm->card->exp_year, -2),
                'is_default' => $pm->id === $user->default_payment_method_id,
            ])->sortByDesc('is_default')->values()->all();
        }

        $setupIntent = $this->getOrCreateSetupIntent($user);

        $billingAddress = $user->addresses()
            ->whereIn('type', ['billing', 'both'])
            ->where('is_default', true)
            ->first()
            ?? $user->addresses()->whereIn('type', ['billing', 'both'])->first();

        return Inertia::render('Account/Payment/Index', [
            'payment_methods' => $paymentMethods,
            'setup_intent'    => $setupIntent,
            'stripe_key'      => config('services.stripe.key'),
            'billing_address' => $billingAddress ? [
                'id'             => $billingAddress->id,
                'full_name'      => $billingAddress->full_name,
                'address_line_1' => $billingAddress->address_line_1,
                'address_line_2' => $billingAddress->address_line_2,
                'city'           => $billingAddress->city,
                'state'          => $billingAddress->state,
                'zip_code'       => $billingAddress->zip_code,
                'country'        => $billingAddress->country,
            ] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'payment_method_id' => 'required|string',
        ]);

        $user = Auth::user();

        if (!$user->stripe_customer_id) {
            $customer = $this->stripe()->customers->create([
                'email' => $user->email,
                'name'  => $user->name,
            ]);
            $user->update(['stripe_customer_id' => $customer->id]);
        }

        $this->stripe()->paymentMethods->attach($request->payment_method_id, [
            'customer' => $user->stripe_customer_id,
        ]);

        $existing = $this->stripe()->paymentMethods->all([
            'customer' => $user->stripe_customer_id,
            'type'     => 'card',
        ]);

        if (count($existing->data) === 1) {
            $user->update(['default_payment_method_id' => $request->payment_method_id]);

            $this->stripe()->customers->update($user->stripe_customer_id, [
                'invoice_settings' => ['default_payment_method' => $request->payment_method_id],
            ]);
        }

        return back()->with('success', 'Card added successfully.');
    }

    public function setDefault(Request $request, string $paymentMethodId): RedirectResponse
    {
        $user = Auth::user();

        abort_unless($user->stripe_customer_id, 403);

        $pm = $this->stripe()->paymentMethods->retrieve($paymentMethodId);
        abort_unless($pm->customer === $user->stripe_customer_id, 403);

        $user->update(['default_payment_method_id' => $paymentMethodId]);

        $this->stripe()->customers->update($user->stripe_customer_id, [
            'invoice_settings' => ['default_payment_method' => $paymentMethodId],
        ]);

        return back()->with('success', 'Default payment method updated.');
    }

    public function destroy(string $paymentMethodId): RedirectResponse
    {
        $user = Auth::user();

        abort_unless($user->stripe_customer_id, 403);

        $pm = $this->stripe()->paymentMethods->retrieve($paymentMethodId);
        abort_unless($pm->customer === $user->stripe_customer_id, 403);

        $this->stripe()->paymentMethods->detach($paymentMethodId);

        if ($user->default_payment_method_id === $paymentMethodId) {
            $remaining = $this->stripe()->paymentMethods->all([
                'customer' => $user->stripe_customer_id,
                'type'     => 'card',
            ]);

            $nextDefault = $remaining->data[0]->id ?? null;
            $user->update(['default_payment_method_id' => $nextDefault]);

            if ($nextDefault) {
                $this->stripe()->customers->update($user->stripe_customer_id, [
                    'invoice_settings' => ['default_payment_method' => $nextDefault],
                ]);
            }
        }

        return back()->with('success', 'Card removed successfully.');
    }

    private function getOrCreateSetupIntent(object $user): string
    {
        $params = ['usage' => 'off_session'];

        if ($user->stripe_customer_id) {
            $params['customer'] = $user->stripe_customer_id;
        }

        $intent = $this->stripe()->setupIntents->create($params);

        return $intent->client_secret;
    }
}