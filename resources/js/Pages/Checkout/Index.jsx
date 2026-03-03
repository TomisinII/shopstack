import {TextInput} from '@/Components';
import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

// ─── Shipping method definitions (shared) ────────────────────────────────────
const SHIPPING_METHODS = [
    { id: 'standard', label: 'Standard Shipping', subtitle: '3-5 business days', price: null,  display: 'Free' },
    { id: 'express',  label: 'Express Shipping',  subtitle: '1-2 business days', price: 5000,  display: null  },
    { id: 'same_day', label: 'Same-Day Delivery', subtitle: 'Order before 12pm', price: 10000, display: null  },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }) {
    const steps = ['Shipping', 'Payment', 'Confirmation'];
    return (
        <div className="flex items-center justify-center mb-10">
            {steps.map((label, i) => {
                const done   = step > i + 1;
                const active = step === i + 1;
                return (
                    <div key={label} className="flex items-center">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                ${done   ? 'bg-green-500 text-white'
                                : active ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/25'
                                :          'bg-gray-100 text-gray-400'}`}>
                                {done ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : i + 1}
                            </div>
                            <span className={`text-sm font-medium ${active ? 'text-gray-900 font-semibold' : done ? 'text-gray-500' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`w-16 sm:w-24 h-0.5 mx-3 transition-colors ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
function OrderSummary({ cart, shippingCost }) {
    const shipping = shippingCost ?? cart.shipping;
    const total    = cart.subtotal + shipping + cart.tax - cart.discount;
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>
            <div className="space-y-4 mb-5 max-h-60 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                                {item.image
                                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full bg-gray-200" />}
                            </div>
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {item.quantity}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                            {item.variant && <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                            {formatCurrency(item.subtotal)}
                        </span>
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2.5">
                {[
                    { label: 'Subtotal',              value: formatCurrency(cart.subtotal),                             },
                    { label: 'Shipping',              value: shipping === 0 ? 'Free' : formatCurrency(shipping), green: shipping === 0 },
                    { label: `Tax (${cart.tax_rate}%)`, value: formatCurrency(cart.tax)                                },
                    ...(cart.discount > 0 ? [{ label: 'Discount', value: `− ${formatCurrency(cart.discount)}`, red: true }] : []),
                ].map(({ label, value, green, red }) => (
                    <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className={`font-medium ${green ? 'text-green-600' : red ? 'text-red-500' : 'text-gray-900'}`}>{value}</span>
                    </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
}
// ─── Step 1: Shipping ─────────────────────────────────────────────────────────
function ShippingStep({ data, setData, errors, savedAddresses, onContinue }) {
    const set = (path, value) => {
        if (path.startsWith('shipping.')) {
            const key = path.replace('shipping.', '');
            setData(p => ({ ...p, shipping: { ...p.shipping, [key]: value } }));
        } else {
            setData(p => ({ ...p, [path]: value }));
        }
    };

    const fillAddress = (addr) => setData(p => ({
        ...p,
        shipping: {
            full_name:     addr.full_name     ?? '',
            address_line1: addr.address_line1 ?? '',
            address_line2: addr.address_line2 ?? '',
            city:          addr.city          ?? '',
            state:         addr.state         ?? '',
            zip_code:      addr.zip_code      ?? '',
            phone:         addr.phone         ?? '',
        },
    }));

    return (
        <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Contact Information</h2>
                <TextInput type="email" placeholder="Email address" value={data.email}
                    onChange={e => set('email', e.target.value)} error={errors.email} />
            </div>

            {savedAddresses.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Saved Addresses</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map(addr => (
                            <button key={addr.id} onClick={() => fillAddress(addr)}
                                className="text-left p-3.5 border-2 border-gray-200 rounded-xl hover:border-primary-400 transition-colors">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{addr.label ?? 'Address'}</p>
                                <p className="text-sm font-medium text-gray-900">{addr.full_name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{addr.address_line1}, {addr.city}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-3">
                    <TextInput placeholder="Full name" value={data.shipping.full_name}
                        onChange={e => set('shipping.full_name', e.target.value)} error={errors['shipping.full_name']} />
                    <TextInput placeholder="Address line 1" value={data.shipping.address_line1}
                        onChange={e => set('shipping.address_line1', e.target.value)} error={errors['shipping.address_line1']} />
                    <TextInput placeholder="Address line 2 (optional)" value={data.shipping.address_line2}
                        onChange={e => set('shipping.address_line2', e.target.value)} />
                    <div className="grid grid-cols-3 gap-3">
                        <TextInput placeholder="City"     value={data.shipping.city}     onChange={e => set('shipping.city', e.target.value)}     error={errors['shipping.city']} />
                        <TextInput placeholder="State"    value={data.shipping.state}    onChange={e => set('shipping.state', e.target.value)}    error={errors['shipping.state']} />
                        <TextInput placeholder="ZIP code" value={data.shipping.zip_code} onChange={e => set('shipping.zip_code', e.target.value)} error={errors['shipping.zip_code']} />
                    </div>
                    <TextInput placeholder="Phone number" value={data.shipping.phone}
                        onChange={e => set('shipping.phone', e.target.value)} error={errors['shipping.phone']} />
                    <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                        <input type="checkbox" checked={data.save_address}
                            onChange={e => set('save_address', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
                        <span className="text-sm text-gray-600">Save this address for future orders</span>
                    </label>
                </div>
            </div>

            <button onClick={onContinue}
                className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-colors text-sm shadow-lg shadow-primary-900/20">
                Continue to Payment
            </button>
        </div>
    );
}

// ─── Stripe Card Form ─────────────────────────────────────────────────────────
function StripeCardForm({ publicKey, shippingMethod, onSuccess }) {
    const cardRef        = useRef(null);
    const stripeRef      = useRef(null);
    const cardElementRef = useRef(null);
    const [cardError, setCardError]   = useState('');
    const [processing, setProcessing] = useState(false);
    const [ready, setReady]           = useState(false);

    useEffect(() => {
        let mounted = true;

        const initStripe = () => {
            if (!mounted || !cardRef.current) return;

            stripeRef.current    = window.Stripe(publicKey);
            const elements       = stripeRef.current.elements();
            cardElementRef.current = elements.create('card', {
                style: {
                    base:    { fontSize: '14px', color: '#111827', fontFamily: 'inherit', '::placeholder': { color: '#9ca3af' } },
                    invalid: { color: '#ef4444' },
                },
            });
            cardElementRef.current.mount(cardRef.current);
            cardElementRef.current.on('ready',  ()  => { if (mounted) setReady(true); });
            cardElementRef.current.on('change', (e) => { if (mounted) setCardError(e.error?.message ?? ''); });
        };

        if (window.Stripe) {
            // Already loaded
            initStripe();
        } else {
            // Load then init
            const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
            if (!existing) {
                const s = document.createElement('script');
                s.src = 'https://js.stripe.com/v3/';
                s.onload = initStripe;
                document.head.appendChild(s);
            } else {
                existing.addEventListener('load', initStripe);
            }
        }

        return () => {
            mounted = false;
            cardElementRef.current?.unmount();
            cardElementRef.current = null;
        };
    }, [publicKey]);

    const pay = async () => {
        if (!stripeRef.current || !cardElementRef.current) return;
        setProcessing(true);
        setCardError('');
        try {
            const res = await fetch(route('checkout.stripe-intent'), {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':       'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ shipping_method: shippingMethod }),
            });

            if (!res.ok) {
                setCardError('Failed to initialize payment. Please try again.');
                setProcessing(false);
                return;
            }

            const { client_secret } = await res.json();

            const { error, paymentIntent } = await stripeRef.current.confirmCardPayment(client_secret, {
                payment_method: { card: cardElementRef.current },
            });

            if (error) {
                setCardError(error.message);
                setProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                onSuccess({ payment_intent_id: paymentIntent.id });
            } else {
                setCardError('Payment was not completed. Please try again.');
                setProcessing(false);
            }
        } catch (err) {
            setCardError('Something went wrong. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[52px]">
                <div ref={cardRef} className="py-1" />
                {!ready && (
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Loading secure payment form...
                    </p>
                )}
            </div>
            {cardError && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {cardError}
                </p>
            )}
            <button
                onClick={pay}
                disabled={processing || !ready}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm shadow-lg shadow-primary-900/20"
            >
                {processing
                    ? <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                }
                {processing ? 'Processing...' : 'Pay with Card'}
            </button>
        </div>
    );
}

// ─── Step 2: Payment ──────────────────────────────────────────────────────────
function PaymentStep({ data, setData, errors, cart, gateways, stripePublicKey, onBack, onSubmit, onPaystack, processing }) {
    const set = (key, value) => setData(p => ({ ...p, [key]: value }));

    const shippingCost = data.shipping_method === 'standard'
        ? cart.shipping
        : (SHIPPING_METHODS.find(m => m.id === data.shipping_method)?.price ?? 0);
    const total = cart.subtotal + shippingCost + cart.tax - cart.discount;

    return (
        <div className="space-y-5">
            {/* Shipping method */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Shipping Method</h2>
                <div className="space-y-3">
                    {SHIPPING_METHODS.map(method => {
                        const isSelected = data.shipping_method === method.id;
                        const cost = method.id === 'standard' ? cart.shipping : method.price;
                        return (
                            <label key={method.id}
                                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                                    ${isSelected ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="shipping_method" value={method.id} checked={isSelected}
                                    onChange={() => set('shipping_method', method.id)}
                                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                                    <p className="text-xs text-gray-500">{method.subtitle}</p>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                    {method.display ?? formatCurrency(cost)}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Payment Method</h2>

                {!gateways.stripe && !gateways.paystack && !gateways.cod && (
                    <p className="text-sm text-red-500">No payment methods are currently enabled. Please contact support.</p>
                )}

                <div className="space-y-3 mb-5">
                    {gateways.stripe && (
                        <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                            ${data.payment_method === 'stripe' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="payment_method" value="stripe" checked={data.payment_method === 'stripe'}
                                onChange={() => set('payment_method', 'stripe')}
                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-900">Credit / Debit Card</span>
                            <span className="ml-auto text-xs text-gray-400">Powered by Stripe</span>
                        </label>
                    )}

                    {gateways.paystack && (
                        <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                            ${data.payment_method === 'paystack' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="payment_method" value="paystack" checked={data.payment_method === 'paystack'}
                                onChange={() => set('payment_method', 'paystack')}
                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-900">Paystack</span>
                            <span className="ml-auto text-xs text-gray-400">Cards, Bank Transfer, USSD</span>
                        </label>
                    )}

                    {gateways.cod && (
                        <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                            ${data.payment_method === 'cod' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="payment_method" value="cod" checked={data.payment_method === 'cod'}
                                onChange={() => set('payment_method', 'cod')}
                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-900">Cash on Delivery</span>
                        </label>
                    )}
                </div>

                {/* Stripe card fields — only show after terms agreed */}
                {data.payment_method === 'stripe' && stripePublicKey && (
                    data.agreed_to_terms
                        ? <StripeCardForm publicKey={stripePublicKey} shippingMethod={data.shipping_method} onSuccess={(extra) => onSubmit(extra)} />
                        : <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">Please agree to the Terms & Conditions below before entering card details.</p>
                )}
            </div>

            {/* Terms */}
            <div className={`flex items-start gap-3 p-4 bg-white border-2 rounded-2xl transition-colors ${errors.agreed_to_terms ? 'border-red-300' : 'border-gray-100'}`}>
                <input type="checkbox" id="terms" checked={data.agreed_to_terms}
                    onChange={e => set('agreed_to_terms', e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer flex-shrink-0" />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                    I agree to the{' '}
                    <Link href="#" className="text-primary-600 hover:underline font-medium">Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link href="#" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
                </label>
            </div>
            {errors.agreed_to_terms && <p className="text-xs text-red-500 -mt-3">{errors.agreed_to_terms}</p>}
            {errors.payment && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl p-3">{errors.payment}</p>
            )}

            {/* COD + Paystack action buttons */}
            {(data.payment_method === 'cod' || data.payment_method === 'paystack') && (
                <div className="flex items-center gap-3">
                    <button onClick={onBack}
                        className="px-6 py-4 text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                        Back
                    </button>

                    {data.payment_method === 'cod' && (
                        <button onClick={() => onSubmit({})} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 disabled:opacity-60 transition-colors text-sm shadow-lg shadow-primary-900/20">
                            {processing
                                ? <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                            }
                            {processing ? 'Placing Order...' : `Place Order · ${formatCurrency(total)}`}
                        </button>
                    )}

                    {/* Paystack — calls onPaystack which is defined in parent with live dataRef */}
                    {data.payment_method === 'paystack' && (
                        <button onClick={onPaystack} disabled={!data.agreed_to_terms || processing}
                            className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-[#0BA4DB] text-white font-bold rounded-2xl hover:bg-[#0993c5] disabled:opacity-60 transition-colors text-sm shadow-lg">
                            {processing
                                ? <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                : null
                            }
                            {processing ? 'Processing...' : `Pay ${formatCurrency(total)} with Paystack`}
                        </button>
                    )}
                </div>
            )}

            {/* Back button for Stripe (its pay button is inside StripeCardForm) */}
            {data.payment_method === 'stripe' && (
                <button onClick={onBack}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                    ← Back
                </button>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index({ cart, savedAddresses, userEmail, gateways, stripePublicKey, paystackPublicKey }) {
    const [step, setStep]             = useState(1);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors]         = useState({});

    const defaultGateway = gateways.stripe ? 'stripe' : gateways.paystack ? 'paystack' : 'cod';

    const [data, setData] = useState({
        email:           userEmail ?? '',
        shipping: {
            full_name:     '',
            address_line1: '',
            address_line2: '',
            city:          '',
            state:         '',
            zip_code:      '',
            phone:         '',
        },
        save_address:    false,
        shipping_method: 'standard',
        payment_method:  defaultGateway,
        agreed_to_terms: false,
        notes:           '',
    });

    // Always keep a live ref so async Paystack callback never reads stale state
    const dataRef = useRef(data);
    useEffect(() => { dataRef.current = data; }, [data]);

    // Load Stripe.js
    useEffect(() => {
        if (gateways.stripe && stripePublicKey && !window.Stripe) {
            const s = document.createElement('script');
            s.src   = 'https://js.stripe.com/v3/';
            s.async = true;
            document.head.appendChild(s);
        }
    }, []);

    // Load Paystack.js
    useEffect(() => {
        if (gateways.paystack && paystackPublicKey && !window.PaystackPop) {
            const s = document.createElement('script');
            s.src   = 'https://js.paystack.co/v1/inline.js';
            s.async = true;
            document.head.appendChild(s);
        }
    }, []);

    const validateStep1 = () => {
        const e = {};
        if (!data.email)                  e.email = 'Email is required';
        if (!data.shipping.full_name)     e['shipping.full_name'] = 'Full name is required';
        if (!data.shipping.address_line1) e['shipping.address_line1'] = 'Address is required';
        if (!data.shipping.city)          e['shipping.city'] = 'City is required';
        if (!data.shipping.state)         e['shipping.state'] = 'State is required';
        if (!data.shipping.zip_code)      e['shipping.zip_code'] = 'ZIP code is required';
        if (!data.shipping.phone)         e['shipping.phone'] = 'Phone is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // Called by COD and Stripe (after card confirmed on frontend)
    const submitOrder = (extra = {}) => {
        const current = dataRef.current;
        if (!current.agreed_to_terms) {
            setErrors({ agreed_to_terms: 'You must agree to the terms to continue' });
            return;
        }
        setProcessing(true);
        router.post(route('checkout.store'), { ...current, ...extra }, {
            onError:  (e) => { setErrors(e); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    // Paystack popup — defined here in the root component so it always
    // reads the freshest data via dataRef, never a stale closure snapshot.
    const openPaystack = () => {
        const current = dataRef.current;

        if (!current.agreed_to_terms) {
            setErrors({ agreed_to_terms: 'You must agree to the terms to continue' });
            return;
        }
        if (!window.PaystackPop) {
            setErrors({ payment: 'Paystack is still loading. Please wait a moment and try again.' });
            return;
        }

        const shippingCost = current.shipping_method === 'standard'
            ? cart.shipping
            : (SHIPPING_METHODS.find(m => m.id === current.shipping_method)?.price ?? 0);
        const total = cart.subtotal + shippingCost + cart.tax - cart.discount;

        const handler = window.PaystackPop.setup({
            key:      paystackPublicKey,
            email:    current.email,
            amount:   Math.round(total * 100),
            currency: 'NGN',
            ref:      'PSK_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),

            onSuccess: async (transaction) => {
                const latest = dataRef.current;
                setProcessing(true);

                try {
                    const res = await fetch(route('checkout.paystack'), {
                        method:  'POST',
                        headers: {
                            'Content-Type':  'application/json',
                            'X-CSRF-TOKEN':  document.querySelector('meta[name="csrf-token"]')?.content,
                            'X-Inertia':     'true', // keep session alive
                        },
                        body: JSON.stringify({
                            ...latest,
                            payment_method:      'paystack',
                            paystack_reference:  transaction.reference,
                            agreed_to_terms:     true,
                        }),
                    });

                    const json = await res.json();

                    if (json.redirect) {
                        // Hard redirect — bypasses Inertia router entirely
                        // This is intentional: Paystack popup context breaks router.post
                        window.location.href = json.redirect;
                    } else {
                        setErrors({ payment: json.error ?? 'Order could not be placed. Please contact support.' });
                        setProcessing(false);
                    }
                } catch {
                    setErrors({ payment: 'Something went wrong. Please contact support.' });
                    setProcessing(false);
                }
            },

            onCancel: () => setProcessing(false),
        });

        handler.openIframe();
    };

    const shippingCost = data.shipping_method === 'standard'
        ? cart.shipping
        : (SHIPPING_METHODS.find(m => m.id === data.shipping_method)?.price ?? 0);

    return (
        <AppLayout>
            <Head title="Checkout — ShopStack" />
            <div className="min-h-screen bg-gray-50/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <StepIndicator step={step} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2">
                            {step === 1 && (
                                <ShippingStep
                                    data={data} setData={setData} errors={errors}
                                    savedAddresses={savedAddresses}
                                    onContinue={() => { if (validateStep1()) { setErrors({}); setStep(2); } }}
                                />
                            )}
                            {step === 2 && (
                                <PaymentStep
                                    data={data} setData={setData} errors={errors}
                                    cart={cart}
                                    gateways={gateways}
                                    stripePublicKey={stripePublicKey}
                                    onBack={() => { setStep(1); setErrors({}); }}
                                    onSubmit={submitOrder}
                                    onPaystack={openPaystack}
                                    processing={processing}
                                />
                            )}
                        </div>
                        <div className="lg:col-span-1">
                            <OrderSummary cart={cart} shippingCost={shippingCost} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}