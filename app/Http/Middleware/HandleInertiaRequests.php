<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user()?->getRoleNames() ?? [],
            ],
            'cart' => function () use ($request) {
                $sessionId = $request->session()->get('cart_session_id');

                $cart = auth()->check()
                    ? \App\Models\Cart::where('user_id', auth()->id())->first()
                    : ($sessionId ? \App\Models\Cart::where('session_id', $sessionId)->whereNull('user_id')->first() : null);

                if (!$cart) {
                    return ['items_count' => 0, 'subtotal' => 0, 'items' => []];
                }

                $cart->load(['items.product.images', 'items.variant']);

                $items = $cart->items->map(function ($item) {
                    $product = $item->product;
                    $variant = $item->variant;

                    $imageUrl = null;
                    $primaryImage = $product?->images->firstWhere('is_primary', true) ?? $product?->images->first();
                    if ($primaryImage?->url) {
                        $imageUrl = str_starts_with($primaryImage->url, 'http')
                            ? $primaryImage->url
                            : \Storage::url($primaryImage->url);
                    }

                    return [
                        'id'         => $item->id,
                        'product_id' => $item->product_id,
                        'variant_id' => $item->variant_id,
                        'name'       => $product?->name ?? 'Product',
                        'slug'       => $product?->slug,
                        'image'      => $imageUrl,
                        'price'      => $item->price,
                        'quantity'   => $item->quantity,
                        'subtotal'   => round($item->price * $item->quantity, 2),
                        'variant'    => $variant
                            ? collect($variant->attributes)->map(fn ($v, $k) => $v)->implode(', ')
                            : null,
                    ];
                });

                return [
                    'items_count' => $items->sum('quantity'),
                    'subtotal'    => $items->sum('subtotal'),
                    'items'       => $items,
                ];
            },

            'wishlist' => fn () => auth()->check()
                ? ['count' => \App\Models\Wishlist::where('user_id', auth()->id())->count()]
                : ['count' => 0],

            'wishlist_ids' => $request->user()
                ? $request->user()->wishlists()->pluck('product_id')->toArray()
                : [],
                
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }
}
