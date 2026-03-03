<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(): Response
    {
        $items = Wishlist::where('user_id', auth()->id())
            ->with(['product' => fn ($q) => $q->with(['brand', 'images', 'approvedReviews'])])
            ->latest()
            ->get()
            ->filter(fn ($w) => $w->product && $w->product->status === 'published')
            ->map(fn ($w) => $this->formatItem($w))
            ->values();

        return Inertia::render('Wishlist/Index', [
            'items' => $items,
        ]);
    }

    public function toggle(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $existing = Wishlist::where('user_id', auth()->id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            $existing->delete();
            return back()->with('success', 'Removed from wishlist');
        }

        Wishlist::create([
            'user_id'    => auth()->id(),
            'product_id' => $request->product_id,
        ]);

        return back()->with('success', 'Added to wishlist');
    }

    public function remove(Request $request, Wishlist $wishlist): RedirectResponse
    {
        abort_unless($wishlist->user_id === auth()->id(), 403);
        $wishlist->delete();

        return back()->with('success', 'Removed from wishlist');
    }

    public function clear(): RedirectResponse
    {
        Wishlist::where('user_id', auth()->id())->delete();

        return back()->with('success', 'Wishlist cleared');
    }

    public function moveToCart(Request $request, Wishlist $wishlist): RedirectResponse
    {
        abort_unless($wishlist->user_id === auth()->id(), 403);

        $product = $wishlist->product;

        if (!$product || $product->status !== 'published') {
            return back()->withErrors(['error' => 'Product is no longer available.']);
        }

        // Resolve or create cart
        $cart = \App\Models\Cart::firstOrCreate(
            ['user_id' => auth()->id()],
            ['session_id' => null]
        );

        $price = $product->isOnSale() ? $product->sale_price : $product->price;

        $existing = $cart->items()
            ->where('product_id', $product->id)
            ->whereNull('variant_id')
            ->first();

        if ($existing) {
            $existing->increment('quantity');
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'variant_id' => null,
                'quantity'   => 1,
                'price'      => $price,
            ]);
        }

        $wishlist->delete();

        return back()->with('success', "{$product->name} moved to cart");
    }

    private function formatItem(Wishlist $w): array
    {
        $p = $w->product;

        $primaryImage = $p->images->firstWhere('is_primary', true) ?? $p->images->first();
        $imageUrl = null;
        if ($primaryImage?->url) {
            $imageUrl = str_starts_with($primaryImage->url, 'http')
                ? $primaryImage->url
                : Storage::url($primaryImage->url);
        }

        $avgRating   = $p->approvedReviews->avg('rating') ?? 0;
        $reviewCount = $p->approvedReviews->count();

        return [
            'wishlist_id'         => $w->id,
            'added_at'            => $w->created_at->diffForHumans(),
            'product_id'          => $p->id,
            'name'                => $p->name,
            'slug'                => $p->slug,
            'brand'               => $p->brand?->name,
            'image'               => $imageUrl,
            'price'               => $p->price,
            'sale_price'          => $p->isOnSale() ? $p->sale_price : null,
            'discount_percentage' => $p->getDiscountPercentage(),
            'is_new'              => $p->created_at->gte(now()->subDays(14)),
            'stock_status'        => $p->stock_status,
            'average_rating'      => round($avgRating, 1),
            'review_count'        => $reviewCount,
        ];
    }
}