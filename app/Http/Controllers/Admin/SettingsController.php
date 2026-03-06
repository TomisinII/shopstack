<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Render the settings page with all grouped settings pre-loaded.
     */
    public function index(Request $request): Response
    {
        $tab = $request->get('tab', 'general');

        return Inertia::render('Admin/Settings/Index', [
            'tab'      => $tab,
            'settings' => $this->getAllSettings(),
        ]);
    }

    /**
     * Save a group of settings submitted from a tab form.
     */
    public function update(Request $request): RedirectResponse
    {
        $tab = $request->input('tab', 'general');

        match ($tab) {
            'general'  => $this->saveGeneral($request),
            'payment'  => $this->savePayment($request),
            'shipping' => $this->saveShipping($request),
            'tax'      => $this->saveTax($request),
            'email'    => $this->saveEmail($request),
            'advanced' => $this->saveAdvanced($request),
            default    => null,
        };

        return redirect()->route('admin.settings.index', ['tab' => $tab])
                         ->with('success', ucfirst($tab) . ' settings saved successfully.');
    }

    // ─── Tab savers ──────────────────────────────────────────────────────────

    private function saveGeneral(Request $request): void
    {
        $data = $request->validate([
            'store_name'    => 'required|string|max:255',
            'store_tagline' => 'nullable|string|max:255',
            'store_email'   => 'required|email|max:255',
            'store_phone'   => 'nullable|string|max:50',
            'currency'      => 'required|string|max:10',
            'timezone'      => 'required|string|max:60',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, $value, 'general');
        }
    }

    private function savePayment(Request $request): void
    {
        $data = $request->validate([
            'payment_stripe_enabled'  => 'nullable|boolean',
            'payment_paystack_enabled'=> 'nullable|boolean',
            'payment_cod_enabled'     => 'nullable|boolean',
            'stripe_public_key'       => 'nullable|string|max:255',
            'stripe_secret_key'       => 'nullable|string|max:255',
            'paystack_public_key'     => 'nullable|string|max:255',
            'paystack_secret_key'     => 'nullable|string|max:255',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, is_bool($value) ? ($value ? '1' : '0') : $value, 'payment');
        }
    }

    private function saveShipping(Request $request): void
    {
        $data = $request->validate([
            'shipping_zones'                      => 'nullable|array',
            'shipping_zones.*.name'               => 'required|string|max:100',
            'shipping_zones.*.rates'              => 'nullable|array',
            'shipping_zones.*.rates.*.label'      => 'required|string|max:100',
            'shipping_zones.*.rates.*.price'      => 'required|numeric|min:0',
            'shipping_zones.*.rates.*.free_over'  => 'nullable|numeric|min:0',
        ]);

        Setting::set('shipping_zones', json_encode($data['shipping_zones'] ?? []), 'shipping');
    }

    private function saveTax(Request $request): void
    {
        $data = $request->validate([
            'tax_enabled'        => 'boolean',
            'tax_prices_include' => 'boolean',
            'tax_based_on'       => 'required|in:shipping_address,billing_address,store_address',
            'tax_rate'           => 'nullable|numeric|min:0|max:100',
        ]);

        $booleans = ['tax_enabled', 'tax_prices_include'];
        $strings  = ['tax_based_on', 'tax_rate'];

        foreach ($booleans as $key) {
            Setting::set($key, !empty($data[$key]) ? '1' : '0', 'tax');
        }

        foreach ($strings as $key) {
            if (array_key_exists($key, $data) && $data[$key] !== null) {
                Setting::set($key, $data[$key], 'tax');
            }
        }
    }

    private function saveEmail(Request $request): void
    {
        $data = $request->validate([
            'mail_driver'          => 'required|in:smtp,sendmail,mailgun,ses,log',
            'mail_host'            => 'nullable|string|max:255',
            'mail_port'            => 'nullable|integer',
            'mail_username'        => 'nullable|string|max:255',
            'mail_password'        => 'nullable|string|max:255',
            'mail_encryption'      => 'nullable|in:tls,ssl,',
            'mail_from_address'    => 'required|email|max:255',
            'mail_from_name'       => 'required|string|max:255',
            'notify_new_order'     => 'boolean',
            'notify_order_shipped' => 'boolean',
            'notify_low_stock'     => 'boolean',
            'notify_new_customer'  => 'boolean',
        ]);

        $booleans = ['notify_new_order', 'notify_order_shipped', 'notify_low_stock', 'notify_new_customer'];
        $strings  = ['mail_driver', 'mail_host', 'mail_port', 'mail_username', 'mail_password', 'mail_encryption', 'mail_from_address', 'mail_from_name'];

        foreach ($booleans as $key) {
            Setting::set($key, !empty($data[$key]) ? '1' : '0', 'email');
        }

        foreach ($strings as $key) {
            if (array_key_exists($key, $data) && $data[$key] !== null) {
                Setting::set($key, $data[$key], 'email');
            }
        }
    }

    private function saveAdvanced(Request $request): void
    {
        $data = $request->validate([
            'maintenance_mode'    => 'boolean',
            'guest_checkout'      => 'boolean',
            'user_registration'   => 'boolean',
            'google_analytics_id' => 'nullable|string|max:50',
            'facebook_pixel_id'   => 'nullable|string|max:50',
            'items_per_page'      => 'required|integer|min:4|max:100',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, is_bool($value) ? ($value ? '1' : '0') : $value, 'advanced');
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Collect all settings into a structured array for the frontend.
     * DB values take priority; falls back to .env (via config()) when blank.
     */
    private function getAllSettings(): array
    {
        $raw = Setting::all()->keyBy('key');

        // Returns DB value if present and non-empty, otherwise falls back to $default
        $get = fn (string $key, mixed $default = '') => 
            (isset($raw[$key]) && $raw[$key]->value !== null && $raw[$key]->value !== '')
                ? $raw[$key]->value
                : $default;

        $shippingZones = json_decode($get('shipping_zones', '[]'), true) ?: [
            [
                'name'  => 'Domestic',
                'rates' => [
                    ['label' => 'Standard', 'price' => 0,  'free_over' => null],
                    ['label' => 'Express',  'price' => 10, 'free_over' => null],
                ],
            ],
        ];

        return [
            // General
            'store_name'    => $get('store_name',    config('app.name', 'ShopStack')),
            'store_tagline' => $get('store_tagline', ''),
            'store_email'   => $get('store_email',   ''),
            'store_phone'   => $get('store_phone',   ''),
            'currency'      => $get('currency',      'NGN'),
            'timezone'      => $get('timezone',      config('app.timezone', 'UTC')),

            // Payment — falls back to .env via config('services.*')
            'payment_stripe_enabled'  => $get('payment_stripe_enabled',  '0') === '1',
            'payment_paystack_enabled'=> $get('payment_paystack_enabled', '0') === '1',
            'payment_cod_enabled'     => $get('payment_cod_enabled',      '0') === '1',
            'stripe_public_key'       => $get('stripe_public_key',  config('services.stripe.key',           '')),
            'stripe_secret_key'       => $get('stripe_secret_key',  config('services.stripe.secret',        '')),
            'paystack_public_key'     => $get('paystack_public_key', config('services.paystack.public_key', '')),
            'paystack_secret_key'     => $get('paystack_secret_key', config('services.paystack.secret',     '')),

            // Shipping
            'shipping_zones' => $shippingZones,

            // Tax
            'tax_enabled'        => $get('tax_enabled',        '0') === '1',
            'tax_prices_include' => $get('tax_prices_include',  '0') === '1',
            'tax_based_on'       => $get('tax_based_on',        'shipping_address'),
            'tax_rate'           => $get('tax_rate',            '0'),

            // Email — falls back to .env via config('mail.*')
            'mail_driver'          => $get('mail_driver',       config('mail.default',                  'smtp')),
            'mail_host'            => $get('mail_host',         config('mail.mailers.smtp.host',         '')),
            'mail_port'            => $get('mail_port',         config('mail.mailers.smtp.port',         '587')),
            'mail_username'        => $get('mail_username',     config('mail.mailers.smtp.username',     '')),
            'mail_password'        => $get('mail_password',     config('mail.mailers.smtp.password',     '')),
            'mail_encryption'      => $get('mail_encryption',   config('mail.mailers.smtp.encryption',   'tls')),
            'mail_from_address'    => $get('mail_from_address', config('mail.from.address',              '')),
            'mail_from_name'       => $get('mail_from_name',    config('mail.from.name', config('app.name', 'ShopStack'))),
            'notify_new_order'     => $get('notify_new_order',     '1') === '1',
            'notify_order_shipped' => $get('notify_order_shipped', '1') === '1',
            'notify_low_stock'     => $get('notify_low_stock',     '1') === '1',
            'notify_new_customer'  => $get('notify_new_customer',  '0') === '1',

            // Advanced
            'maintenance_mode'    => $get('maintenance_mode',    '0') === '1',
            'guest_checkout'      => $get('guest_checkout',      '1') === '1',
            'user_registration'   => $get('user_registration',   '1') === '1',
            'google_analytics_id' => $get('google_analytics_id', ''),
            'facebook_pixel_id'   => $get('facebook_pixel_id',   ''),
            'items_per_page'      => (int) $get('items_per_page', '15'),
        ];
    }
}