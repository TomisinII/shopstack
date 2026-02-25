<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // ── General ─────────────────────────────────────────
            ['key' => 'store_name',    'value' => 'ShopStack',                       'group' => 'general'],
            ['key' => 'store_tagline', 'value' => 'Everything you need, delivered.', 'group' => 'general'],
            ['key' => 'store_email',   'value' => 'hello@shopstack.com',             'group' => 'general'],
            ['key' => 'store_phone',   'value' => '+234 800 000 0001',               'group' => 'general'],
            ['key' => 'currency',      'value' => 'NGN',                             'group' => 'general'],
            ['key' => 'timezone',      'value' => 'Africa/Lagos',                    'group' => 'general'],


            ['key' => 'payment_stripe_enabled', 'value' => '1',                         'group' => 'payment'],
            ['key' => 'payment_paypal_enabled',  'value' => '1',                         'group' => 'payment'],
            ['key' => 'payment_cod_enabled',     'value' => '1',                         'group' => 'payment'],
            ['key' => 'stripe_public_key',       'value' => 'pk_test_xxxxxxxxxxxxxxxx',  'group' => 'payment'],
            ['key' => 'stripe_secret_key',       'value' => 'sk_test_xxxxxxxxxxxxxxxx',  'group' => 'payment'],
            ['key' => 'paystack_public_key',     'value' => 'pk_test_xxxxxxxxxxxxxxxx',  'group' => 'payment'],
            ['key' => 'paystack_secret_key',     'value' => 'sk_test_xxxxxxxxxxxxxxxx',  'group' => 'payment'],


            ['key' => 'shipping_zones', 'value' => json_encode([
                [
                    'name'  => 'Domestic',
                    'rates' => [
                        ['label' => 'Standard', 'price' => 2500,  'free_over' => 50000],
                        ['label' => 'Express',  'price' => 5000,  'free_over' => null],
                        ['label' => 'Same Day', 'price' => 10000, 'free_over' => null],
                    ],
                ],
                [
                    'name'  => 'International',
                    'rates' => [
                        ['label' => 'Standard', 'price' => 15000, 'free_over' => null],
                    ],
                ],
            ]), 'group' => 'shipping'],


            ['key' => 'tax_enabled',        'value' => '1',                'group' => 'tax'],
            ['key' => 'tax_prices_include', 'value' => '0',                'group' => 'tax'],
            ['key' => 'tax_based_on',       'value' => 'shipping_address', 'group' => 'tax'],
            ['key' => 'tax_rate',           'value' => '7.5',              'group' => 'tax'],


            ['key' => 'mail_driver',       'value' => 'smtp',                 'group' => 'email'],
            ['key' => 'mail_host',         'value' => 'smtp.mailtrap.io',     'group' => 'email'],
            ['key' => 'mail_port',         'value' => '587',                  'group' => 'email'],
            ['key' => 'mail_username',     'value' => '',                     'group' => 'email'],
            ['key' => 'mail_password',     'value' => '',                     'group' => 'email'],
            ['key' => 'mail_encryption',   'value' => 'tls',                  'group' => 'email'],
            ['key' => 'mail_from_address', 'value' => 'noreply@shopstack.com','group' => 'email'],
            ['key' => 'mail_from_name',    'value' => 'ShopStack',            'group' => 'email'],
            ['key' => 'notify_new_order',     'value' => '1', 'group' => 'email'],
            ['key' => 'notify_order_shipped', 'value' => '1', 'group' => 'email'],
            ['key' => 'notify_low_stock',     'value' => '1', 'group' => 'email'],
            ['key' => 'notify_new_customer',  'value' => '0', 'group' => 'email'],

            
            ['key' => 'maintenance_mode',    'value' => '0',  'group' => 'advanced'],
            ['key' => 'guest_checkout',      'value' => '1',  'group' => 'advanced'],
            ['key' => 'user_registration',   'value' => '1',  'group' => 'advanced'],
            ['key' => 'google_analytics_id', 'value' => '',   'group' => 'advanced'],
            ['key' => 'facebook_pixel_id',   'value' => '',   'group' => 'advanced'],
            ['key' => 'items_per_page',      'value' => '15', 'group' => 'advanced'],
        ];

        foreach ($settings as $data) {
            Setting::firstOrCreate(['key' => $data['key']], $data);
        }
    }
}