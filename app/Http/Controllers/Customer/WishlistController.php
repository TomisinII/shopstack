<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(): Response
    {
        $items = Auth::user()
            ->wishlists()
            ->with(['product.images', 'product.brand', 'product.variants', 'product.approvedReviews'])
            ->latest()
            ->get()
            ->filter(fn ($w) => $w->product && $w->product->status === 'published')
            ->values();

        return Inertia::render('Account/Wishlist/Index', [
            'items' => $items->map(fn ($wishlist) => [
                'wishlist_id' => $wishlist->id,
                'product'     => $this->formatProduct($wishlist->product),
            ]),
        ]);
    }

    public function toggle(Request $request): RedirectResponse
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        $user     = Auth::user();
        $existing = $user->wishlists()->where('product_id', $request->product_id)->first();

        if ($existing) {
            $existing->delete();
        } else {
            $user->wishlists()->create(['product_id' => $request->product_id]);
        }

        return back();
    }

    public function moveToCart(Wishlist $wishlist): RedirectResponse
    {
        abort_unless($wishlist->user_id === Auth::id(), 403);

        $product = $wishlist->product;

        if ($product && $product->status === 'published') {
            Auth::user()->getOrCreateCart()->addItem($product);
        }

        $wishlist->delete();

        return back()->with('success', 'Item moved to cart.');
    }

    public function remove(Wishlist $wishlist): RedirectResponse
    {
        abort_unless($wishlist->user_id === Auth::id(), 403);

        $wishlist->delete();

        return back()->with('success', 'Removed from wishlist.');
    }

    public function clear(): RedirectResponse
    {
        Auth::user()->wishlists()->delete();

        return back()->with('success', 'Wishlist cleared.');
    }

    private function formatProduct(Product $product): array
    {
        $avgRating = $product->approvedReviews->avg('rating') ?? 0;

        $colorVariants = $product->variants
            ->map(fn ($v) => $v->attributes['color'] ?? null)
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        return [
            'id'                  => $product->id,
            'name'                => $product->name,
            'slug'                => $product->slug,
            'price'               => (float) $product->price,
            'sale_price'          => $product->sale_price ? (float) $product->sale_price : null,
            'image'               => $product->getPrimaryImageUrl(),
            'brand'               => $product->brand?->name,
            'average_rating'      => round((float) $avgRating, 1),
            'review_count'        => $product->approvedReviews->count(),
            'discount_percentage' => $product->getDiscountPercentage(),
            'is_new'              => $product->created_at->gt(now()->subDays(30)),
            'is_wishlisted'       => true,
            'stock_status'        => $product->stock_status,
            'color_variants'      => $colorVariants,
        ];
    }
}