<?php

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /** Nigerian cities for shipping addresses */
    private array $cities = [
        ['city' => 'Lagos',         'state' => 'Lagos',         'zip' => '100001'],
        ['city' => 'Abuja',         'state' => 'FCT',           'zip' => '900001'],
        ['city' => 'Kano',          'state' => 'Kano',          'zip' => '700001'],
        ['city' => 'Ibadan',        'state' => 'Oyo',           'zip' => '200001'],
        ['city' => 'Port Harcourt', 'state' => 'Rivers',        'zip' => '500001'],
        ['city' => 'Enugu',         'state' => 'Enugu',         'zip' => '400001'],
    ];

    public function run(): void
    {
        $customers = User::role('Customer')->get();
        $products  = Product::with(['variants', 'user'])->published()->get();

        if ($customers->isEmpty() || $products->isEmpty()) {
            return;
        }

        // Spread orders across the last 90 days with realistic distribution
        $orderScenarios = [
            // [status, payment_status, payment_method, days_ago_min, days_ago_max, count]
            ['delivered', 'paid',       'stripe',    60, 90, 12],
            ['delivered', 'paid',       'paystack',  45, 75, 10],
            ['delivered', 'paid',       'cod',       30, 60,  8],
            ['shipped',   'paid',       'stripe',    10, 25,  8],
            ['shipped',   'paid',       'paystack',   8, 20,  5],
            ['processing','paid',       'stripe',     1, 10,  7],
            ['processing','paid',       'paystack',   1,  8,  5],
            ['pending',   'pending',    'stripe',     0,  3,  6],
            ['pending',   'pending',    'cod',        0,  2,  4],
            ['cancelled', 'failed',     'stripe',    15, 40,  4],
            ['cancelled', 'refunded',   'paystack',  10, 35,  3],
            ['refunded',  'refunded',   'stripe',    20, 50,  3],
        ];

        $year        = now()->year;
        $orderNumber = Order::whereYear('created_at', $year)->count();

        foreach ($orderScenarios as $scenario) {
            [$status, $paymentStatus, $paymentMethod, $minDays, $maxDays, $count] = $scenario;

            for ($i = 0; $i < $count; $i++) {
                $customer  = $customers->random();
                $location  = $this->cities[array_rand($this->cities)];
                $createdAt = now()->subDays(rand($minDays, $maxDays))->subHours(rand(0, 23));

                // Pick 1–4 random products
                $orderProducts = $products->random(rand(1, 4));
                $items         = $this->buildItems($orderProducts);

                $subtotal  = collect($items)->sum('subtotal');
                $shipping  = $subtotal >= 50000 ? 0.00 : 2500.00;
                $discount  = 0.00;
                $couponCode = null;

                // ~25% of orders use a coupon
                if (rand(1, 4) === 1 && in_array($status, ['delivered', 'shipped', 'processing'])) {
                    $coupon = Coupon::active()->first();
                    if ($coupon && $subtotal >= ($coupon->minimum_order_amount ?? 0)) {
                        $couponCode = $coupon->code;
                        $discount   = $coupon->type === 'percentage'
                            ? min($subtotal * ($coupon->value / 100), $coupon->maximum_discount ?? PHP_INT_MAX)
                            : $coupon->value;
                        $coupon->increment('used_count');
                    }
                }

                $tax   = round(($subtotal - $discount) * 0.075, 2); // 7.5% VAT
                $total = round($subtotal + $shipping + $tax - $discount, 2);

                $orderNumber++;
                $orderRef = sprintf('ORD-%d-%04d', $year, $orderNumber);

                $order = Order::create([
                    'order_number'           => $orderRef,
                    'user_id'                => $customer->id,
                    'status'                 => $status,
                    'payment_status'         => $paymentStatus,
                    'payment_method'         => $paymentMethod,
                    'subtotal'               => $subtotal,
                    'shipping_cost'          => $shipping,
                    'tax_amount'             => $tax,
                    'discount_amount'        => $discount,
                    'total'                  => $total,
                    'currency'               => 'NGN',
                    'coupon_code'            => $couponCode,
                    // Shipping address
                    'shipping_full_name'     => $customer->name,
                    'shipping_phone'         => $customer->phone ?? '+2348000000000',
                    'shipping_address_line_1'=> rand(1, 50) . ' Sample Street',
                    'shipping_city'          => $location['city'],
                    'shipping_state'         => $location['state'],
                    'shipping_zip'           => $location['zip'],
                    'shipping_country'       => 'Nigeria',
                    // Billing mirrors shipping for most orders
                    'billing_full_name'      => $customer->name,
                    'billing_phone'          => $customer->phone ?? '+2348000000000',
                    'billing_address_line_1' => rand(1, 50) . ' Sample Street',
                    'billing_city'           => $location['city'],
                    'billing_state'          => $location['state'],
                    'billing_zip'            => $location['zip'],
                    'billing_country'        => 'Nigeria',
                    // Tracking
                    'tracking_number'        => in_array($status, ['shipped', 'delivered']) ? 'TRK' . strtoupper(substr(md5(uniqid()), 0, 10)) : null,
                    'shipped_at'             => in_array($status, ['shipped', 'delivered']) ? $createdAt->copy()->addDays(rand(2, 5)) : null,
                    'delivered_at'           => $status === 'delivered' ? $createdAt->copy()->addDays(rand(5, 10)) : null,
                    'customer_notes'         => rand(0, 5) === 0 ? 'Please leave at the gate if no one is home.' : null,
                    'admin_notes'            => rand(0, 8) === 0 ? 'Customer called to confirm address.' : null,
                    'created_at'             => $createdAt,
                    'updated_at'             => $createdAt,
                ]);

                // Create order items
                foreach ($items as $item) {
                    OrderItem::create(array_merge($item, ['order_id' => $order->id]));

                    // Deduct stock for non-cancelled/refunded orders
                    if (!in_array($status, ['cancelled', 'refunded'])) {
                        $product = $products->find($item['product_id']);
                        if ($product && $product->track_inventory) {
                            $product->decrement('stock_quantity', $item['quantity']);
                        }
                    }
                }

                // Create vendor transactions for paid orders
                if ($paymentStatus === 'paid') {
                    $this->createVendorTransactions($order, $items);
                }
            }
        }
    }

    private function buildItems($orderProducts): array
    {
        $items = [];

        foreach ($orderProducts as $product) {
            $variant  = $product->variants->isNotEmpty() ? $product->variants->random() : null;
            $price    = $variant ? ($variant->price ?? $product->getCurrentPrice()) : $product->getCurrentPrice();
            $quantity = rand(1, 3);

            $items[] = [
                'product_id'         => $product->id,
                'product_variant_id' => $variant?->id,
                'vendor_id'          => $product->user_id,
                'product_name'       => $product->name . ($variant ? " ({$variant->name})" : ''),
                'product_sku'        => $variant?->sku ?? $product->sku,
                'quantity'           => $quantity,
                'unit_price'         => $price,
                'subtotal'           => round($price * $quantity, 2),
            ];
        }

        return $items;
    }

    private function createVendorTransactions(Order $order, array $items): void
    {
        $vendorGroups = collect($items)->groupBy('vendor_id');

        foreach ($vendorGroups as $vendorId => $vendorItems) {
            if (!$vendorId) continue;

            $vendor = User::find($vendorId);
            if (!$vendor) continue;

            $commissionRate = $vendor->profile?->commission_rate ?? 15.00;
            $gross          = collect($vendorItems)->sum('subtotal');
            $commission     = round($gross * ($commissionRate / 100), 2);
            $net            = round($gross - $commission, 2);

            Transaction::create([
                'vendor_id'         => $vendorId,
                'order_id'          => $order->id,
                'type'              => 'earning',
                'amount'            => $gross,
                'commission_amount' => $commission,
                'net_amount'        => $net,
                'status'            => in_array($order->status, ['delivered', 'shipped']) ? 'completed' : 'pending',
                'description'       => "Earning from order {$order->order_number}",
                'created_at'        => $order->created_at,
                'updated_at'        => $order->updated_at,
            ]);
        }
    }
}