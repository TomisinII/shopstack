<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    private array $fiveStarTitles = [
        'Absolutely love it!', 'Exceeded my expectations', 'Best purchase this year',
        'Outstanding quality', 'Would buy again', '10/10 recommend',
        'Worth every kobo', 'Perfect in every way',
    ];

    private array $fourStarTitles = [
        'Very good overall', 'Great product, minor issues',
        'Happy with this purchase', 'Good value for money',
        'Solid product', 'Would recommend',
    ];

    private array $threeStarTitles = [
        'It\'s okay', 'Decent but expected more', 'Average product',
        'Some good, some bad', 'Room for improvement',
    ];

    private array $twoStarTitles = [
        'Disappointed', 'Not what I expected', 'Below average',
        'Had issues', 'Needs improvement',
    ];

    private array $oneStarTitles = [
        'Very disappointed', 'Do not recommend', 'Waste of money',
        'Terrible experience', 'Would not buy again',
    ];

    private array $reviewBodies = [
        5 => [
            'I have been using this for three weeks now and I am thoroughly impressed. The quality is exceptional and it does exactly what it promises. Delivery was quick and packaging was excellent. Highly recommend to anyone considering this purchase.',
            'Fantastic product! Exactly as described. Arrived well packaged and in perfect condition. My family loves it. Will definitely be ordering again. The customer service was also excellent when I had a question.',
            'This is now my favourite purchase of the year. It works perfectly, looks great, and the build quality feels premium. Fast delivery to Lagos and it was well packed. Five stars without hesitation.',
            'Superb quality and great value. I was a bit hesitant at first given the price, but it has exceeded every expectation. Works exactly as advertised. Shipping was faster than expected too.',
            'Absolutely brilliant! I\'ve recommended this to my whole family. The quality is top-notch and it arrived in just 3 days. Very happy with this purchase and will definitely buy from ShopStack again.',
        ],
        4 => [
            'Really good product overall. The quality is great and it works as described. Only minor issue is the packaging could be a bit sturdier but the item itself arrived in perfect condition. Would buy again.',
            'Very happy with this purchase. It does what it says on the tin and the quality feels solid. Shipping was a bit slower than expected but overall a positive experience. Would recommend.',
            'Good product at a fair price. Arrived well packaged. The only reason I\'m not giving 5 stars is I feel the instructions could be clearer but once set up, it works perfectly.',
            'Great purchase! Solid build quality and good performance. Delivery was on time. I\'d give it 5 stars but there\'s a tiny cosmetic scratch that wasn\'t visible in the photos. Still very happy.',
        ],
        3 => [
            'It\'s an okay product. Does the job but nothing spectacular. I expected a bit more for the price. Shipping was fine. Would consider other options before repurchasing.',
            'Average product. It works as described but quality feels a little lower than I hoped. Customer service was responsive when I had a concern. Wouldn\'t rush to buy again but not terrible.',
            'Decent product but I\'ve used better. For the price it\'s acceptable. Arrived on time and packaging was good. It\'s functional but doesn\'t wow me. Three stars is fair.',
        ],
        2 => [
            'Not very impressed with this product. The quality is below what I expected based on the photos and description. It arrived on time but there were visible defects. Contacted support and waiting for resolution.',
            'Disappointed with this purchase. The product looks different from the photos and feels cheaper than expected. I don\'t regret the price entirely but I won\'t be repurchasing.',
        ],
        1 => [
            'Very disappointed. The product arrived damaged and doesn\'t function properly. I\'ve raised a complaint with customer service and am awaiting a response. Would not recommend based on my experience.',
            'Complete waste of money. Nothing like the description or photos. The quality is terrible. I have submitted a return request. Avoid this product.',
        ],
    ];

    public function run(): void
    {
        // Only create reviews for delivered orders
        $deliveredOrders = Order::with(['items.product', 'user'])
            ->where('status', 'delivered')
            ->get();

        foreach ($deliveredOrders as $order) {
            // ~70% of customers leave at least one review
            if (rand(1, 10) > 7) continue;

            foreach ($order->items as $item) {
                if (!$item->product) continue;

                // ~60% chance of reviewing each item in the order
                if (rand(1, 10) > 6) continue;

                // Check for duplicate review
                $exists = Review::where('product_id', $item->product_id)
                    ->where('user_id', $order->user_id)
                    ->where('order_id', $order->id)
                    ->exists();

                if ($exists) continue;

                // Weight ratings toward higher scores (realistic distribution)
                $rating = $this->weightedRating();

                $titles = match ($rating) {
                    5 => $this->fiveStarTitles,
                    4 => $this->fourStarTitles,
                    3 => $this->threeStarTitles,
                    2 => $this->twoStarTitles,
                    1 => $this->oneStarTitles,
                };

                $bodies = $this->reviewBodies[$rating];

                $createdAt = $order->delivered_at
                    ? $order->delivered_at->copy()->addDays(rand(1, 14))
                    : now()->subDays(rand(1, 30));

                Review::create([
                    'product_id'           => $item->product_id,
                    'user_id'              => $order->user_id,
                    'order_id'             => $order->id,
                    'rating'               => $rating,
                    'title'                => $titles[array_rand($titles)],
                    'review'               => $bodies[array_rand($bodies)],
                    'is_verified_purchase' => true,
                    'is_approved'          => rand(1, 10) > 1, // ~90% auto-approved
                    'helpful_count'        => rand(0, 45),
                    'created_at'           => $createdAt,
                    'updated_at'           => $createdAt,
                ]);
            }
        }

        // Add a handful of unverified public reviews (not from orders)
        $customers = User::role('Customer')->take(5)->get();
        $products  = \App\Models\Product::published()->take(10)->get();

        foreach ($products as $product) {
            $customer = $customers->random();

            $alreadyReviewed = Review::where('product_id', $product->id)
                ->where('user_id', $customer->id)
                ->exists();

            if ($alreadyReviewed) continue;

            $rating = $this->weightedRating();

            Review::create([
                'product_id'           => $product->id,
                'user_id'              => $customer->id,
                'order_id'             => null,
                'rating'               => $rating,
                'title'                => 'Great product',
                'review'               => $this->reviewBodies[$rating][0],
                'is_verified_purchase' => false,
                'is_approved'          => rand(0, 1) === 1,
                'helpful_count'        => rand(0, 10),
                'created_at'           => now()->subDays(rand(5, 60)),
                'updated_at'           => now()->subDays(rand(1, 5)),
            ]);
        }
    }

    /**
     * Weighted random rating — skewed toward 4–5 stars like real e-commerce.
     * Distribution: 5★ 45%, 4★ 30%, 3★ 13%, 2★ 7%, 1★ 5%
     */
    private function weightedRating(): int
    {
        $roll = rand(1, 100);

        return match (true) {
            $roll <= 45 => 5,
            $roll <= 75 => 4,
            $roll <= 88 => 3,
            $roll <= 95 => 2,
            default     => 1,
        };
    }
}