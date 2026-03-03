<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\Address;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@shopstack.com'],
            [
                'name'                     => 'Admin User',
                'password'                 => Hash::make('Admin123!'),
                'phone'                    => '+2348000000001',
                'email_verified_at'        => now(),
                'notification_preferences' => $this->defaultNotifications(),
                'preferences'              => $this->defaultPreferences(),
            ]
        );
        $admin->assignRole('Admin');
        $this->seedAddress($admin, 'Lagos', 'Lagos', true);

        // ── Vendors ────────────────────────────────────────────
        $vendors = [
            [
                'name'        => 'TechVault Nigeria',
                'email'       => 'vendor@shopstack.com',
                'phone'       => '+2348011111111',
                'store_name'  => 'TechVault',
                'store_slug'  => 'techvault',
                'description' => 'Your one-stop shop for premium electronics and gadgets.',
                'commission'  => 12.00,
                'status'      => 'approved',
            ],
            [
                'name'        => 'FashionHub',
                'email'       => 'fashionhub@shopstack.com',
                'phone'       => '+2348022222222',
                'store_name'  => 'FashionHub',
                'store_slug'  => 'fashionhub',
                'description' => 'Trendy clothing and accessories for the modern Nigerian.',
                'commission'  => 15.00,
                'status'      => 'approved',
            ],
            [
                'name'        => 'HomeDecor Pro',
                'email'       => 'homedecor@shopstack.com',
                'phone'       => '+2348033333333',
                'store_name'  => 'HomeDecor Pro',
                'store_slug'  => 'homedecor-pro',
                'description' => 'Beautiful furniture and home essentials for every budget.',
                'commission'  => 18.00,
                'status'      => 'approved',
            ],
            [
                'name'        => 'Pending Vendor',
                'email'       => 'pending@shopstack.com',
                'phone'       => '+2348044444444',
                'store_name'  => 'PendingStore',
                'store_slug'  => 'pendingstore',
                'description' => 'Awaiting approval.',
                'commission'  => 15.00,
                'status'      => 'pending',
            ],
        ];

        foreach ($vendors as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'                     => $data['name'],
                    'password'                 => Hash::make('Vendor123!'),
                    'phone'                    => $data['phone'],
                    'email_verified_at'        => now(),
                    'notification_preferences' => $this->defaultNotifications(),
                    'preferences'              => $this->defaultPreferences(),
                ]
            );
            $user->assignRole('Vendor');

            Profile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'store_name'        => $data['store_name'],
                    'store_slug'        => $data['store_slug'],
                    'store_description' => $data['description'],
                    'commission_rate'   => $data['commission'],
                    'status'            => $data['status'],
                ]
            );

            $this->seedAddress($user, 'Lagos', 'Lagos', true);
        }

        // ── Customers ──────────────────────────────────────────
        $customers = [
            ['name' => 'Amara Okafor',  'email' => 'customer@shopstack.com', 'city' => 'Lagos',         'state' => 'Lagos'],
            ['name' => 'Chidi Eze',     'email' => 'chidi@example.com',      'city' => 'Abuja',         'state' => 'FCT'],
            ['name' => 'Fatima Aliyu',  'email' => 'fatima@example.com',     'city' => 'Kano',          'state' => 'Kano'],
            ['name' => 'Emeka Nwosu',   'email' => 'emeka@example.com',      'city' => 'Enugu',         'state' => 'Enugu'],
            ['name' => 'Ngozi Adeyemi', 'email' => 'ngozi@example.com',      'city' => 'Ibadan',        'state' => 'Oyo'],
            ['name' => 'Bola Osei',     'email' => 'bola@example.com',       'city' => 'Warri',         'state' => 'Delta'],
            ['name' => 'Tunde Bakare',  'email' => 'tunde@example.com',      'city' => 'Lagos',         'state' => 'Lagos'],
            ['name' => 'Chiamaka Igwe', 'email' => 'chiamaka@example.com',   'city' => 'Port Harcourt', 'state' => 'Rivers'],
            ['name' => 'Musa Garba',    'email' => 'musa@example.com',       'city' => 'Kaduna',        'state' => 'Kaduna'],
            ['name' => 'Adaeze Obi',    'email' => 'adaeze@example.com',     'city' => 'Lagos',         'state' => 'Lagos'],
            ['name' => 'Kelechi Ude',   'email' => 'kelechi@example.com',    'city' => 'Onitsha',       'state' => 'Anambra'],
            ['name' => 'Sola Abiodun',  'email' => 'sola@example.com',       'city' => 'Abeokuta',      'state' => 'Ogun'],
        ];

        foreach ($customers as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'                     => $data['name'],
                    'password'                 => Hash::make('Customer123!'),
                    'phone'                    => '+234' . rand(7000000000, 9099999999),
                    'email_verified_at'        => now(),
                    'notification_preferences' => $this->defaultNotifications(),
                    'preferences'              => $this->defaultPreferences(),
                ]
            );
            $user->assignRole('Customer');
            $this->seedAddress($user, $data['city'], $data['state'], true);

            if (rand(0, 1)) {
                $this->seedAddress($user, 'Lagos', 'Lagos', false);
            }
        }
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private function defaultNotifications(): array
    {
        return [
            'order_updates'           => true,
            'shipping_notifications'  => true,
            'promotional_emails'      => true,
            'product_recommendations' => true,
            'weekly_newsletter'       => true,
        ];
    }

    private function defaultPreferences(): array
    {
        return [
            'language' => 'en',
            'currency' => 'NGN',
            'theme'    => 'light',
        ];
    }

    private function seedAddress(User $user, string $city, string $state, bool $isDefault): void
    {
        $streets = [
            '14 Admiralty Way',
            '7 Ozumba Mbadiwe Ave',
            '22 Broad Street',
            '5 Marina Road',
            '11 Awolowo Road',
            '3 Herbert Macaulay Way',
        ];

        Address::firstOrCreate(
            ['user_id' => $user->id, 'city' => $city, 'is_default' => $isDefault],
            [
                'type'           => 'both',
                'full_name'      => $user->name,
                'phone'          => $user->phone ?? '+2348000000000',
                'address_line_1' => $streets[array_rand($streets)],
                'city'           => $city,
                'state'          => $state,
                'zip_code'       => (string) rand(100001, 999999),
                'country'        => 'Nigeria',
                'is_default'     => $isDefault,
            ]
        );
    }
}