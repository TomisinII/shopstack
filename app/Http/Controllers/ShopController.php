<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['brand', 'images', 'approvedReviews', 'category'])
            ->published();

        // ── Filters ──────────────────────────────────────────────────────────

        // Category (supports parent → includes all children)
        if ($request->filled('category')) {
            $cat = Category::find($request->category);
            if ($cat) {
                $childIds = $cat->children()->pluck('id')->prepend($cat->id);
                $query->whereIn('category_id', $childIds);
            }
        }

        // Brands (comma-separated IDs or array)
        if ($request->filled('brands')) {
            $brandIds = is_array($request->brands)
                ? $request->brands
                : explode(',', $request->brands);
            $query->whereIn('brand_id', $brandIds);
        }

        // Price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Rating — minimum average rating
        if ($request->filled('rating')) {
            $query->whereHas('approvedReviews', function ($q) use ($request) {
                $q->select('product_id')
                  ->groupBy('product_id')
                  ->havingRaw('AVG(rating) >= ?', [$request->rating]);
            });
        }

        // Sale only
        if ($request->boolean('sale')) {
            $query->onSale();
        }

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // ── Sorting ───────────────────────────────────────────────────────────

        match ($request->get('sort', 'featured')) {
            'price_asc'      => $query->orderBy('price', 'asc'),
            'price_desc'     => $query->orderBy('price', 'desc'),
            'newest'         => $query->latest(),
            'best_selling'   => $query->withCount('orderItems')->orderByDesc('order_items_count'),
            'top_rated'      => $query->withAvg('approvedReviews', 'rating')->orderByDesc('approved_reviews_avg_rating'),
            default          => $query->orderByDesc('is_featured')->latest(),
        };

        $products = $query->paginate(12)->withQueryString()->through(function ($p) {
            return $this->formatProduct($p);
        });

        // ── Sidebar data ──────────────────────────────────────────────────────

        // Top-level categories with published product counts (including children)
        $categories = Category::whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($c) {
                $ids   = $c->children->pluck('id')->prepend($c->id);
                $count = Product::whereIn('category_id', $ids)->where('status', 'published')->count();
                return ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug, 'products_count' => $count];
            });

        $totalPublished = Product::published()->count();

        $brands = Brand::where('is_active', true)
            ->withCount(['products as products_count' => fn ($q) => $q->where('status', 'published')])
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        // Price bounds for the range slider
        $priceStats = Product::published()->selectRaw('MIN(price) as min_price, MAX(price) as max_price')->first();

        return Inertia::render('Shop/Index', [
            'products'       => $products,
            'categories'     => $categories,
            'brands'         => $brands,
            'totalPublished' => $totalPublished,
            'priceStats'     => [
                'min' => (int) ($priceStats->min_price ?? 0),
                'max' => (int) ($priceStats->max_price ?? 10000),
            ],
            'filters' => [
                'category'  => $request->category,
                'brands'    => $request->brands ? (array) $request->brands : [],
                'min_price' => $request->min_price,
                'max_price' => $request->max_price,
                'rating'    => $request->rating,
                'sort'      => $request->get('sort', 'featured'),
                'sale'      => $request->boolean('sale'),
                'search'    => $request->search,
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        // Abort if not published (unless admin/vendor preview)
        abort_if($product->status !== 'published', 404);

        $product->incrementViews();

        $product->load([
            'brand',
            'category.parent',
            'images'          => fn ($q) => $q->orderBy('sort_order'),
            'variants',
            'approvedReviews' => fn ($q) => $q->with('user')->latest()->take(10),
            'tags',
        ]);

        // Related products — same category, exclude current
        $related = Product::with(['brand', 'images', 'approvedReviews'])
            ->published()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get()
            ->map(fn ($p) => $this->formatProduct($p));

        // Group variants by attribute type (color, size, etc.)
        $variantGroups = $product->variants
            ->flatMap(fn ($v) => collect($v->attributes)->map(fn ($val, $key) => ['type' => $key, 'value' => $val, 'variant_id' => $v->id, 'price' => $v->price, 'stock' => $v->stock_quantity]))
            ->groupBy('type')
            ->map(fn ($items) => $items->unique('value')->values());

        $avgRating   = $product->approvedReviews->avg('rating') ?? 0;
        $reviewCount = $product->approvedReviews->count();

        // Rating distribution
        $ratingDistribution = collect([5, 4, 3, 2, 1])->mapWithKeys(function ($star) use ($product, $reviewCount) {
            $count = $product->approvedReviews->where('rating', $star)->count();
            return [$star => ['count' => $count, 'percent' => $reviewCount > 0 ? round(($count / $reviewCount) * 100) : 0]];
        });

        return Inertia::render('Shop/Show', [
            'product' => [
                'id'               => $product->id,
                'name'             => $product->name,
                'slug'             => $product->slug,
                'sku'              => $product->sku,
                'short_description' => $product->short_description,
                'description'      => $product->description,
                'price'            => $product->price,
                'sale_price'       => $product->isOnSale() ? $product->sale_price : null,
                'discount_percentage' => $product->getDiscountPercentage(),
                'savings'          => $product->isOnSale() ? round($product->price - $product->sale_price, 2) : 0,
                'is_new'           => $product->created_at->gte(now()->subDays(14)),
                'is_featured'      => $product->is_featured,
                'stock_status'     => $product->stock_status,
                'stock_quantity'   => $product->stock_quantity,
                'track_inventory'  => $product->track_inventory,
                'average_rating'   => round($avgRating, 1),
                'review_count'     => $reviewCount,
                'rating_distribution' => $ratingDistribution,
                'brand'            => $product->brand ? ['id' => $product->brand->id, 'name' => $product->brand->name, 'slug' => $product->brand->slug] : null,
                'category'         => $product->category ? [
                    'id'     => $product->category->id,
                    'name'   => $product->category->name,
                    'slug'   => $product->category->slug,
                    'parent' => $product->category->parent ? ['name' => $product->category->parent->name] : null,
                ] : null,
                'images'           => $product->images->map(fn ($img) => [
                    'id'         => $img->id,
                    'url' => Product::resolveImageUrl($img->image_path),
                    'alt'        => $img->alt_text ?? $product->name,
                    'is_primary' => $img->is_primary,
                ]),
                'variants'         => $product->variants->map(fn ($v) => [
                    'id'         => $v->id,
                    'sku'        => $v->sku,
                    'price'      => $v->price,
                    'stock'      => $v->stock_quantity,
                    'attributes' => $v->attributes,
                ]),
                'variant_groups'   => $variantGroups,
                'tags'             => $product->tags->pluck('name'),
                'reviews'          => $product->approvedReviews->map(fn ($r) => [
                    'id'                   => $r->id,
                    'rating'               => $r->rating,
                    'title'                => $r->title,
                    'review'               => $r->review,
                    'is_verified_purchase' => $r->is_verified_purchase,
                    'created_at'           => $r->created_at->format('M d, Y'),
                    'user'                 => ['name' => $r->user->name, 'avatar' => $r->user->avatar],
                ]),
                'meta_title'       => $product->meta_title,
                'meta_description' => $product->meta_description,
            ],
            'related' => $related,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function formatProduct(Product $p): array
    {
        $avgRating   = $p->approvedReviews->avg('rating') ?? 0;
        $reviewCount = $p->approvedReviews->count();

        $primaryImage = $p->images->firstWhere('is_primary', true) ?? $p->images->first();
        $imageUrl = null;
        if ($primaryImage?->image_path) {                                  
            $imageUrl = Product::resolveImageUrl($primaryImage->image_path);
        }

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
            'image'               => $imageUrl,
            'color_variants'      => collect($p->variants ?? [])
                ->filter(fn ($v) => isset($v->attributes['color']))
                ->pluck('attributes.color')
                ->unique()
                ->values(),
        ];
    }
}