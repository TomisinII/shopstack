<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Review;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        // New arrivals — last 30 days, published, with primary image
        $newArrivals = Product::with(['brand', 'images', 'approvedReviews'])
            ->published()
            ->where('created_at', '>=', now()->subDays(30))
            ->latest()
            ->take(8)
            ->get()
            ->map(fn ($p) => $this->formatProduct($p));

        // Best sellers — most ordered
        $bestSellers = Product::with(['brand', 'images', 'approvedReviews'])
            ->published()
            ->withCount('orderItems')
            ->orderByDesc('order_items_count')
            ->take(8)
            ->get()
            ->map(fn ($p) => $this->formatProduct($p));

        // Top-level categories — count published products across self + all children
        $categories = Category::whereNull('parent_id')
            ->with(['children'])
            ->orderBy('sort_order')
            ->take(6)
            ->get()
            ->map(function ($c) {
                // Collect this category's ID + all child IDs
                $ids = $c->children->pluck('id')->prepend($c->id);

                $count = Product::whereIn('category_id', $ids)
                    ->where('status', 'published')
                    ->count();

                return [
                    'id'             => $c->id,
                    'name'           => $c->name,
                    'slug'           => $c->slug,
                    'image'          => $c->image,
                    'products_count' => $count,
                ];
            });

        // Deal of the day — featured product on sale
        $deal = Product::with(['images'])
            ->published()
            ->onSale()
            ->where('is_featured', true)
            ->inRandomOrder()
            ->first();

        // Active brands — no logo requirement so dev seeded brands still show
        $brands = Brand::where('is_active', true)
            ->inRandomOrder()
            ->take(10)
            ->get(['id', 'name', 'slug', 'logo']);

        // Recent approved reviews for testimonials
        $testimonials = Review::with('user')
            ->where('is_approved', true)
            ->where('rating', '>=', 4)
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($r) => [
                'id'                   => $r->id,
                'rating'               => $r->rating,
                'review'               => $r->review,
                'is_verified_purchase' => $r->is_verified_purchase,
                'user'                 => [
                    'name'   => $r->user->name,
                    'avatar' => $r->user->avatar,
                ],
                'created_at' => $r->created_at->format('M Y'),
            ]);

        return Inertia::render('Home', [
            'newArrivals'  => $newArrivals,
            'bestSellers'  => $bestSellers,
            'categories'   => $categories,
            'deal'         => $deal ? $this->formatDeal($deal) : null,
            'brands'       => $brands,
            'testimonials' => $testimonials,
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatProduct(Product $p): array
    {
        $avgRating = $p->approvedReviews->avg('rating') ?? 0;
        $reviewCount = $p->approvedReviews->count();

        return [
            'id'                  => $p->id,
            'name'                => $p->name,
            'slug'                => $p->slug,
            'brand'               => $p->brand?->name,
            'price'               => $p->price,
            'sale_price'          => $p->isOnSale() ? $p->sale_price : null,
            'discount_percentage' => $p->getDiscountPercentage(),
            'is_new'              => $p->created_at->gte(now()->subDays(14)),
            'is_on_sale'          => $p->isOnSale(),
            'stock_status'        => $p->stock_status,
            'average_rating'      => round($avgRating, 1),
            'review_count'        => $reviewCount,
            'image'               => $p->getPrimaryImageUrl(),
            // Variant colors if available
            'color_variants'      => $p->variants
                ->filter(fn ($v) => isset($v->attributes['color']))
                ->pluck('attributes.color')
                ->unique()
                ->values(),
        ];
    }

    private function formatDeal(Product $p): array
    {
        return [
            'id'          => $p->id,
            'name'        => $p->name,
            'slug'        => $p->slug,
            'description' => $p->short_description,
            'price'       => $p->price,
            'sale_price'  => $p->sale_price,
            'sale_end'    => $p->sale_end?->toISOString(),
            'savings'     => round($p->price - $p->sale_price, 2),
            'image'       => $p->getPrimaryImageUrl(),
        ];
    }
}