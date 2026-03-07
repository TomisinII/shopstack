<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use App\Models\Coupon;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\StripeClient;

class CheckoutController extends Controller
{
    private function stripeSecret(): ?string
    {
        return Setting::get('stripe_secret_key')
            ?? config('services.stripe.secret')
            ?? env('STRIPE_SECRET');
    }

    private function stripePublic(): ?string
    {
        return Setting::get('stripe_public_key')
            ?? config('services.stripe.key')
            ?? env('STRIPE_KEY');
    }

    private function paystackSecret(): ?string
    {
        return Setting::get('paystack_secret_key')
            ?? config('services.paystack.secret')
            ?? env('PAYSTACK_SECRET');
    }

    private function paystackPublic(): ?string
    {
        return Setting::get('paystack_public_key')
            ?? config('services.paystack.public_key')  
            ?? env('PAYSTACK_PUBLIC_KEY');
    }

    private function getEnabledGateways(): array
    {
        $stripeEnabled   = Setting::get('payment_stripe_enabled');
        $paystackEnabled = Setting::get('payment_paystack_enabled');
        $codEnabled      = Setting::get('payment_cod_enabled');

        return [
            // If the setting row doesn't exist yet, fall back to whether the key is configured
            'stripe'   => $stripeEnabled !== null
                ? $stripeEnabled === '1'
                : !blank($this->stripeSecret()),
            'paystack' => $paystackEnabled !== null
                ? $paystackEnabled === '1'
                : !blank($this->paystackSecret()),
            'cod'      => $codEnabled !== null
                ? $codEnabled === '1'
                : true,
        ];
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $cart = $this->resolveCart($request);

        if (!$cart || $cart->items()->count() === 0) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $cart->load(['items.product.images', 'items.variant']);

        $summary = $this->buildSummary($cart, $request->session()->get('cart_coupon'));

        $savedAddresses = auth()->check()
            ? Address::where('user_id', auth()->id())
                ->latest()
                ->get(['id', 'full_name', 'address_line_1', 'address_line_2', 'city', 'state', 'zip_code', 'phone', 'country', 'is_default'])
            : collect();

        $gateways  = $this->getEnabledGateways();
        $savedCards    = [];
        $defaultCardId = null;

        if (auth()->check() && $gateways['stripe'] && !blank($this->stripeSecret())) {
            [$savedCards, $defaultCardId] = $this->fetchSavedStripeCards(auth()->user());
        }

        return Inertia::render('Checkout/Index', [
            'cart'              => $summary,
            'savedAddresses'    => $savedAddresses,
            'userEmail'         => auth()->user()?->email ?? '',
            'gateways'          => $gateways,
            'stripePublicKey'   => $gateways['stripe']   ? $this->stripePublic()   : null,
            'paystackPublicKey' => $gateways['paystack'] ? $this->paystackPublic() : null,
            'savedCards'        => $savedCards,
            'defaultCardId'     => $defaultCardId,
        ]);
    }

    public function confirmation(Request $request): Response|RedirectResponse
    {
        $orderNumber = $request->session()->get('last_order_number');
        $orderId     = $request->session()->get('last_order_id');
        $email       = $request->session()->get('last_order_email') ?? auth()->user()?->email;

        if (!$orderNumber) {
            return redirect()->route('home');
        }

        $order        = Order::find($orderId);
        $deliveryDays = match ($order?->shipping_method) {
            'express'  => [1, 2],
            'same_day' => [0, 0],
            default    => [3, 5],
        };

        $start = now()->addDays($deliveryDays[0])->format('M d');
        $end   = now()->addDays($deliveryDays[1])->format('M d, Y');

        return Inertia::render('Checkout/Confirmation', [
            'orderNumber'       => $orderNumber,
            'email'             => $email,
            'estimatedDelivery' => $deliveryDays[0] === $deliveryDays[1] ? $end : "{$start}–{$end}",
            'orderId'           => $orderId,
        ]);
    }

    public function createStripeIntent(Request $request): JsonResponse
    {
        $request->validate(['shipping_method' => 'required|in:standard,express,same_day']);

        $secret = $this->stripeSecret();

        if (blank($secret)) {
            return response()->json([
                'error' => 'Stripe is not configured. Add STRIPE_SECRET to your .env or save the key in Admin → Settings → Payment.',
            ], 503);
        }

        $cart = $this->resolveCart($request);

        if (!$cart || $cart->items()->count() === 0) {
            return response()->json(['error' => 'Your cart is empty.'], 422);
        }

        $summary      = $this->buildSummary($cart, $request->session()->get('cart_coupon'));
        $shippingCost = $this->shippingCost($request->shipping_method, $summary['shipping']);
        $totalKobo    = (int) round(($summary['subtotal'] + $shippingCost + $summary['tax'] - $summary['discount']) * 100);

        if ($totalKobo < 50) {
            return response()->json(['error' => 'Order total is too low to process.'], 422);
        }

        try {
            Stripe::setApiKey($secret);

            $params = [
                'amount'                    => $totalKobo,
                'currency'                  => strtolower(Setting::get('currency', 'ngn')),
                'metadata'                  => ['user_id' => auth()->id() ?? 'guest'],
                'automatic_payment_methods' => ['enabled' => true],
            ];

            if (auth()->check() && auth()->user()->stripe_customer_id) {
                $params['customer'] = auth()->user()->stripe_customer_id;
            }

            $intent = PaymentIntent::create($params);

            return response()->json(['client_secret' => $intent->client_secret]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email'                   => 'required|email',
            'shipping.full_name'      => 'required|string|max:255',
            'shipping.address_line_1' => 'required|string|max:255',
            'shipping.address_line_2' => 'nullable|string|max:255',
            'shipping.city'           => 'required|string|max:100',
            'shipping.state'          => 'required|string|max:100',
            'shipping.zip_code'       => 'required|string|max:20',
            'shipping.phone'          => 'required|string|max:30',
            'shipping_method'         => 'required|in:standard,express,same_day',
            'payment_method'          => 'required|in:stripe,cod',
            'agreed_to_terms'         => 'accepted',
            'payment_intent_id'       => 'required_if:payment_method,stripe|nullable|string',
        ]);

        $cart = $this->resolveCart($request);

        if (!$cart || $cart->items()->count() === 0) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $cart->load(['items.product.images', 'items.variant']);

        $paymentStatus   = 'pending';
        $paymentIntentId = null;

        if ($request->payment_method === 'stripe') {
            $secret = $this->stripeSecret();

            if (blank($secret)) {
                return back()->withErrors(['payment' => 'Stripe is not configured.']);
            }

            try {
                Stripe::setApiKey($secret);
                $intent = PaymentIntent::retrieve($request->payment_intent_id);

                if ($intent->status !== 'succeeded') {
                    return back()->withErrors(['payment' => 'Payment was not completed. Please try again.']);
                }

                $paymentStatus   = 'paid';
                $paymentIntentId = $intent->id;
            } catch (\Exception $e) {
                return back()->withErrors(['payment' => 'Payment verification failed: ' . $e->getMessage()]);
            }
        }

        [$orderId, $orderNumber] = $this->createOrder($request, $cart, $request->payment_method, $paymentStatus, $paymentIntentId, null);

        $this->flashOrderSession($request, $orderId, $orderNumber);

        return redirect()->route('checkout.confirmation');
    }

    public function storePaystack(Request $request): RedirectResponse
    {
        $request->validate([
            'email'                   => 'required|email',
            'shipping.full_name'      => 'required|string|max:255',
            'shipping.address_line_1' => 'required|string|max:255',
            'shipping.address_line_2' => 'nullable|string|max:255',
            'shipping.city'           => 'required|string|max:100',
            'shipping.state'          => 'required|string|max:100',
            'shipping.zip_code'       => 'required|string|max:20',
            'shipping.phone'          => 'required|string|max:30',
            'shipping_method'         => 'required|in:standard,express,same_day',
            'paystack_reference'      => 'required|string',
            'agreed_to_terms'         => 'accepted',
        ]);

        if (!$this->verifyPaystackTransaction($request->paystack_reference)) {
            return response()->json(['error' => 'Paystack payment could not be verified. Please contact support.'], 422);
        }

        $cart = $this->resolveCart($request);

        if (!$cart || $cart->items()->count() === 0) {
            return response()->json(['error' => 'Your cart is empty.'], 422);
        }

        $cart->load(['items.product.images', 'items.variant']);

        [$orderId, $orderNumber] = $this->createOrder($request, $cart, 'paystack', 'paid', null, $request->paystack_reference);

        $this->flashOrderSession($request, $orderId, $orderNumber);

        return redirect()->route('checkout.confirmation');
    }

    private function createOrder(Request $request, Cart $cart, string $paymentMethod, string $paymentStatus, ?string $paymentIntentId, ?string $paymentReference): array
    {
        $couponCode   = $request->session()->get('cart_coupon');
        $summary      = $this->buildSummary($cart, $couponCode);
        $shippingCost = $this->shippingCost($request->shipping_method, $summary['shipping']);
        $total        = max(0, $summary['subtotal'] + $shippingCost + $summary['tax'] - $summary['discount']);

        $orderId     = null;
        $orderNumber = null;

        DB::transaction(function () use (
            $request, $cart, $summary, $shippingCost, $total,
            $couponCode, $paymentMethod, $paymentStatus, $paymentIntentId, $paymentReference,
            &$orderId, &$orderNumber
        ) {
            $order = Order::create([
                'order_number'            => Order::generateOrderNumber(),
                'user_id'                 => auth()->id(),
                'status'                  => $paymentStatus === 'paid' ? 'processing' : 'pending',
                'payment_status'          => $paymentStatus,
                'payment_method'          => $paymentMethod,
                'payment_intent_id'       => $paymentIntentId,
                'payment_reference'       => $paymentReference,
                'subtotal'                => $summary['subtotal'],
                'shipping_cost'           => $shippingCost,
                'tax_amount'              => $summary['tax'],
                'discount_amount'         => $summary['discount'],
                'total'                   => $total,
                'currency'                => Setting::get('currency', 'NGN'),
                'coupon_code'             => $couponCode,
                'shipping_method'         => $request->shipping_method,
                'shipping_full_name'      => $request->input('shipping.full_name'),
                'shipping_phone'          => $request->input('shipping.phone'),
                'shipping_address_line_1' => $request->input('shipping.address_line_1'),
                'shipping_address_line_2' => $request->input('shipping.address_line_2'),
                'shipping_city'           => $request->input('shipping.city'),
                'shipping_state'          => $request->input('shipping.state'),
                'shipping_zip'            => $request->input('shipping.zip_code'),
                'shipping_country'        => 'NG',
                'customer_notes'          => $request->notes,
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_id'         => $item->product_id,
                    'vendor_id'          => $item->product?->user_id,
                    'product_variant_id' => $item->variant_id,
                    'product_name'       => $item->product?->name ?? 'Product',
                    'product_sku'        => $item->variant?->sku ?? $item->product?->sku,
                    'unit_price'         => $item->price,
                    'quantity'           => $item->quantity,
                    'subtotal'           => round($item->price * $item->quantity, 2),
                ]);

                if ($item->product?->track_inventory) {
                    $item->variant
                        ? $item->variant->decrement('stock_quantity', $item->quantity)
                        : $item->product->decrement('stock_quantity', $item->quantity);
                }
            }

            if (auth()->check() && $request->boolean('save_address')) {
                Address::updateOrCreate(
                    ['user_id' => auth()->id(), 'is_default' => true],
                    [
                        'type'           => 'both',
                        'full_name'      => $request->input('shipping.full_name'),
                        'address_line_1' => $request->input('shipping.address_line_1'),
                        'address_line_2' => $request->input('shipping.address_line_2'),
                        'city'           => $request->input('shipping.city'),
                        'state'          => $request->input('shipping.state'),
                        'zip_code'       => $request->input('shipping.zip_code'),
                        'phone'          => $request->input('shipping.phone'),
                        'country'        => 'Nigeria',
                        'is_default'     => true,
                    ]
                );
            }

            $cart->items()->delete();

            $orderId     = $order->id;
            $orderNumber = $order->order_number;
        });

        $request->session()->forget('cart_coupon');

        return [$orderId, $orderNumber];
    }

    private function flashOrderSession(Request $request, int $orderId, string $orderNumber): void
    {
        $request->session()->put('last_order_number', $orderNumber);
        $request->session()->put('last_order_id', $orderId);
        $request->session()->put('last_order_email', $request->input('email'));
    }

    private function verifyPaystackTransaction(string $reference): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->paystackSecret(),
                'Content-Type'  => 'application/json',
            ])->get("https://api.paystack.co/transaction/verify/{$reference}");

            $data = $response->json();

            return ($data['status'] ?? false) === true
                && ($data['data']['status'] ?? '') === 'success';
        } catch (\Exception) {
            return false;
        }
    }

    private function resolveCart(Request $request): ?Cart
    {
        if (auth()->check()) {
            return Cart::where('user_id', auth()->id())->first();
        }

        $sessionId = $request->session()->get('cart_session_id');

        return $sessionId
            ? Cart::where('session_id', $sessionId)->whereNull('user_id')->first()
            : null;
    }

    private function shippingCost(string $method, float $standardCost): float
    {
        return match ($method) {
            'express'  => 5000,
            'same_day' => 10000,
            default    => $standardCost,
        };
    }

    private function buildSummary(Cart $cart, ?string $couponCode = null): array
    {
        $items    = $cart->items;
        $subtotal = $items->sum(fn ($i) => $i->price * $i->quantity);

        $taxEnabled = Setting::get('tax_enabled') === '1';
        $taxRate    = (float) Setting::get('tax_rate', '0');
        $shipping   = $subtotal >= 50000 ? 0.0 : 2500.0;
        $tax        = $taxEnabled ? round($subtotal * ($taxRate / 100), 2) : 0.0;

        $discount = 0.0;
        if ($couponCode) {
            $coupon = Coupon::where('code', strtoupper($couponCode))
                ->where('is_active', true)
                ->where(fn ($q) => $q->whereNull('valid_until')->orWhere('valid_until', '>', now()))
                ->first();

            if ($coupon) {
                $discount = $coupon->type === 'percentage'
                    ? round($subtotal * ($coupon->value / 100), 2)
                    : min((float) $coupon->value, $subtotal);
            }
        }

        return [
            'items'         => $items->map(fn ($i) => $this->formatItem($i)),
            'items_count'   => $items->sum('quantity'),
            'subtotal'      => $subtotal,
            'shipping'      => $shipping,
            'tax'           => $tax,
            'tax_rate'      => $taxRate,
            'discount'      => $discount,
            'total'         => max(0.0, $subtotal + $shipping + $tax - $discount),
            'free_shipping' => $shipping === 0.0,
        ];
    }

    private function formatItem($item): array
    {
        $product      = $item->product;
        $primaryImage = $product?->images->firstWhere('is_primary', true) ?? $product?->images->first();

        $imageUrl = null;
        if ($primaryImage?->image_path) {
            $imageUrl = str_starts_with($primaryImage->image_path, 'http')
                ? $primaryImage->image_path
                : Storage::url($primaryImage->image_path);
        }

        return [
            'id'       => $item->id,
            'name'     => $product?->name ?? 'Product',
            'image'    => $imageUrl,
            'price'    => $item->price,
            'quantity' => $item->quantity,
            'subtotal' => round($item->price * $item->quantity, 2),
            'variant'  => $item->variant
                ? collect($item->variant->attributes)->implode(', ')
                : null,
        ];
    }

    private function fetchSavedStripeCards($user): array
    {
        if (!$user->stripe_customer_id) {
            return [[], null];
        }

        try {
            $stripe  = new StripeClient($this->stripeSecret());
            $methods = $stripe->paymentMethods->all([
                'customer' => $user->stripe_customer_id,
                'type'     => 'card',
            ]);

            $cards = collect($methods->data)->map(fn ($pm) => [
                'id'         => $pm->id,
                'brand'      => ucfirst($pm->card->brand),
                'last4'      => $pm->card->last4,
                'exp_month'  => str_pad($pm->card->exp_month, 2, '0', STR_PAD_LEFT),
                'exp_year'   => substr($pm->card->exp_year, -2),
                'is_default' => $pm->id === $user->default_payment_method_id,
            ])->sortByDesc('is_default')->values()->all();

            return [$cards, $user->default_payment_method_id];
        } catch (\Exception) {
            return [[], null];
        }
    }
}