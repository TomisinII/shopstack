<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Get or create a cart for the current user or guest session.
     */
    private function resolveCart(Request $request): Cart
    {
        if (auth()->check()) {
            $cart = Cart::firstOrCreate(
                ['user_id' => auth()->id()],
                ['session_id' => null]
            );

            // Merge guest cart if exists
            $sessionId = $request->session()->get('cart_session_id');
            if ($sessionId) {
                $guestCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();
                if ($guestCart) {
                    $this->mergeCarts($guestCart, $cart);
                    $guestCart->delete();
                    $request->session()->forget('cart_session_id');
                }
            }

            return $cart;
        }

        // Guest cart via session
        $sessionId = $request->session()->get('cart_session_id');
        if ($sessionId) {
            $cart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();
            if ($cart) return $cart;
        }

        $sessionId = \Str::uuid()->toString();
        $request->session()->put('cart_session_id', $sessionId);

        return Cart::create(['session_id' => $sessionId, 'user_id' => null]);
    }

    private function mergeCarts(Cart $from, Cart $into): void
    {
        foreach ($from->items as $item) {
            $existing = $into->items()
                ->where('product_id', $item->product_id)
                ->where('variant_id', $item->variant_id)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $item->quantity);
            } else {
                $into->items()->create([
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity'   => $item->quantity,
                    'price'      => $item->price,
                ]);
            }
        }
    }


    private function formatItem(CartItem $item): array
    {
        $product = $item->product;
        $variant = $item->variant;

        $imageUrl = null;
        $primaryImage = $product?->images->firstWhere('is_primary', true) ?? $product?->images->first();
        if ($primaryImage?->url) {
            $imageUrl = str_starts_with($primaryImage->url, 'http')
                ? $primaryImage->url
                : Storage::url($primaryImage->url);
        }

        return [
            'id'         => $item->id,
            'product_id' => $item->product_id,
            'variant_id' => $item->variant_id,
            'name'       => $product?->name ?? 'Product',
            'slug'       => $product?->slug,
            'sku'        => $variant?->sku ?? $product?->sku,
            'image'      => $imageUrl,
            'price'      => $item->price,
            'quantity'   => $item->quantity,
            'subtotal'   => round($item->price * $item->quantity, 2),
            'variant'    => $variant ? collect($variant->attributes)
                ->map(fn ($val, $key) => ucfirst($key) . ': ' . $val)
                ->implode(', ') : null,
            'max_quantity' => $product?->track_inventory
                ? ($variant?->stock_quantity ?? $product->stock_quantity)
                : 99,
        ];
    }

    private function cartSummary(Cart $cart, ?string $couponCode = null): array
    {
        $cart->load(['items.product.images', 'items.variant']);

        $items    = $cart->items->map(fn ($i) => $this->formatItem($i));
        $subtotal = $items->sum('subtotal');

        // Shipping — free over 50000
        $shipping = $subtotal >= 50000 ? 0 : 5000;

        // Tax — 8%
        $tax = round($subtotal * 0.08, 2);

        // Coupon discount
        $discount     = 0;
        $couponApplied = null;
        if ($couponCode) {
            $coupon = Coupon::where('code', strtoupper($couponCode))
                ->where('is_active', true)
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->first();

            if ($coupon) {
                $discount = $coupon->type === 'percentage'
                    ? round($subtotal * ($coupon->value / 100), 2)
                    : min($coupon->value, $subtotal);
                $couponApplied = ['code' => $coupon->code, 'discount' => $discount, 'type' => $coupon->type, 'value' => $coupon->value];
            }
        }

        $total = max(0, $subtotal + $shipping + $tax - $discount);

        return [
            'items'         => $items,
            'items_count'   => $items->sum('quantity'),
            'subtotal'      => $subtotal,
            'shipping'      => $shipping,
            'tax'           => $tax,
            'discount'      => $discount,
            'total'         => $total,
            'coupon'        => $couponApplied,
            'free_shipping' => $shipping === 0,
        ];
    }

    public function index(Request $request): Response
    {
        $cart    = $this->resolveCart($request);
        $coupon  = $request->session()->get('cart_coupon');
        $summary = $this->cartSummary($cart, $coupon);

        return Inertia::render('Cart/Index', [
            'cart'   => $summary,
            'coupon' => $coupon,
        ]);
    }

    public function add(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'integer|min:1|max:99',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $product  = Product::findOrFail($request->product_id);
        $variant  = $request->variant_id ? ProductVariant::find($request->variant_id) : null;
        $quantity = $request->quantity ?? 1;
        $price    = $variant?->price ?? ($product->isOnSale() ? $product->sale_price : $product->price);

        $cart = $this->resolveCart($request);

        $existing = $cart->items()
            ->where('product_id', $product->id)
            ->where('variant_id', $request->variant_id)
            ->first();

        if ($existing) {
            $existing->increment('quantity', $quantity);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'variant_id' => $request->variant_id,
                'quantity'   => $quantity,
                'price'      => $price,
            ]);
        }

        return back()->with('success', 'Added to cart');
    }


    public function update(Request $request, CartItem $item): RedirectResponse
    {
        $this->authorizeItem($request, $item);

        $request->validate(['quantity' => 'required|integer|min:1|max:99']);

        $item->update(['quantity' => $request->quantity]);

        return back()->with('success', 'Cart updated');
    }


    public function remove(Request $request, CartItem $item): RedirectResponse
    {
        $this->authorizeItem($request, $item);
        $item->delete();

        return back()->with('success', 'Item removed');
    }

    public function clear(Request $request): RedirectResponse
    {
        $cart = $this->resolveCart($request);
        $cart->items()->delete();
        $request->session()->forget('cart_coupon');

        return back()->with('success', 'Cart cleared');
    }

    public function applyCoupon(Request $request): RedirectResponse
    {
        $request->validate(['coupon' => 'required|string|max:50']);

        $code   = strtoupper(trim($request->coupon));
        $coupon = Coupon::where('code', $code)
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->first();

        if (!$coupon) {
            return back()->withErrors(['coupon' => 'Invalid or expired coupon code.']);
        }

        $request->session()->put('cart_coupon', $code);

        return back()->with('success', "Coupon \"{$code}\" applied!");
    }


    public function removeCoupon(Request $request): RedirectResponse
    {
        $request->session()->forget('cart_coupon');
        return back()->with('success', 'Coupon removed');
    }

    private function authorizeItem(Request $request, CartItem $item): void
    {
        $cart = $this->resolveCart($request);
        abort_unless($item->cart_id === $cart->id, 403);
    }
}