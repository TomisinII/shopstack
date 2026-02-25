<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            // Welcome / first-order coupons
            [
                'code'                   => 'WELCOME10',
                'type'                   => 'percentage',
                'value'                  => 10.00,
                'minimum_order_amount'   => 15000,
                'maximum_discount'       => 25000,
                'usage_limit'            => null,
                'usage_limit_per_user'   => 1,
                'used_count'             => 14,
                'valid_from'             => now()->subMonths(6),
                'valid_until'            => now()->addMonths(6),
                'is_active'              => true,
            ],
            [
                'code'                   => 'FIRSTORDER',
                'type'                   => 'fixed',
                'value'                  => 5000,
                'minimum_order_amount'   => 20000,
                'usage_limit'            => null,
                'usage_limit_per_user'   => 1,
                'used_count'             => 32,
                'valid_from'             => now()->subMonths(3),
                'valid_until'            => now()->addYear(),
                'is_active'              => true,
            ],

            // Flash sale / time-limited
            [
                'code'                   => 'FLASH20',
                'type'                   => 'percentage',
                'value'                  => 20.00,
                'minimum_order_amount'   => 30000,
                'maximum_discount'       => 50000,
                'usage_limit'            => 100,
                'usage_limit_per_user'   => 1,
                'used_count'             => 67,
                'valid_from'             => now()->subDays(2),
                'valid_until'            => now()->addDays(5),
                'is_active'              => true,
            ],
            [
                'code'                   => 'MIDYEAR25',
                'type'                   => 'percentage',
                'value'                  => 25.00,
                'minimum_order_amount'   => 50000,
                'maximum_discount'       => 75000,
                'usage_limit'            => 500,
                'usage_limit_per_user'   => 2,
                'used_count'             => 243,
                'valid_from'             => now()->subMonth(),
                'valid_until'            => now()->addDays(10),
                'is_active'              => true,
            ],

            // Free shipping
            [
                'code'                   => 'FREESHIP',
                'type'                   => 'free_shipping',
                'value'                  => 0,
                'minimum_order_amount'   => 25000,
                'usage_limit'            => null,
                'usage_limit_per_user'   => 3,
                'used_count'             => 89,
                'valid_from'             => now()->subMonths(2),
                'valid_until'            => now()->addMonths(4),
                'is_active'              => true,
            ],
            [
                'code'                   => 'SHIPFREE50',
                'type'                   => 'free_shipping',
                'value'                  => 0,
                'minimum_order_amount'   => 50000,
                'usage_limit'            => null,
                'usage_limit_per_user'   => 999, // effectively unlimited
                'used_count'             => 12,
                'valid_from'             => now()->subWeek(),
                'valid_until'            => now()->addMonths(2),
                'is_active'              => true,
            ],

            // Fixed amount discounts
            [
                'code'                   => 'SAVE5K',
                'type'                   => 'fixed',
                'value'                  => 5000,
                'minimum_order_amount'   => 40000,
                'usage_limit'            => null,
                'usage_limit_per_user'   => 2,
                'used_count'             => 55,
                'valid_from'             => now()->subMonths(1),
                'valid_until'            => now()->addMonths(3),
                'is_active'              => true,
            ],
            [
                'code'                   => 'SAVE10K',
                'type'                   => 'fixed',
                'value'                  => 10000,
                'minimum_order_amount'   => 80000,
                'usage_limit'            => 200,
                'usage_limit_per_user'   => 1,
                'used_count'             => 88,
                'valid_from'             => now()->subDays(15),
                'valid_until'            => now()->addDays(30),
                'is_active'              => true,
            ],

            // Expired (for testing UI state)
            [
                'code'                   => 'EXPIRED30',
                'type'                   => 'percentage',
                'value'                  => 30.00,
                'minimum_order_amount'   => null,
                'usage_limit'            => 500,
                'usage_limit_per_user'   => 1,
                'used_count'             => 498,
                'valid_from'             => now()->subMonths(3),
                'valid_until'            => now()->subWeek(),
                'is_active'              => false,
            ],

            // Usage limit exhausted (for testing)
            [
                'code'                   => 'SOLDOUT',
                'type'                   => 'percentage',
                'value'                  => 15.00,
                'minimum_order_amount'   => null,
                'usage_limit'            => 50,
                'usage_limit_per_user'   => 1,
                'used_count'             => 50,
                'valid_from'             => now()->subMonth(),
                'valid_until'            => now()->addMonth(),
                'is_active'              => true,
            ],

            // No restrictions (admin testing)
            [
                'code'                   => 'ADMIN100',
                'type'                   => 'percentage',
                'value'                  => 100.00,
                'minimum_order_amount'   => null,
                'maximum_discount'       => null,
                'usage_limit'            => null,
                'usage_limit_per_user'   => 999, // effectively unlimited
                'used_count'             => 0,
                'valid_from'             => null,
                'valid_until'            => null,
                'is_active'              => true,
            ],
        ];

        foreach ($coupons as $data) {
            Coupon::firstOrCreate(['code' => $data['code']], $data);
        }
    }
}