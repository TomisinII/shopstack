import { TextInput } from '@/Components';
import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const SHIPPING_METHODS = [
    { id: 'standard', label: 'Standard Shipping', subtitle: '3-5 business days', price: null,  display: 'Free' },
    { id: 'express',  label: 'Express Shipping',  subtitle: '1-2 business days', price: 5000,  display: null  },
    { id: 'same_day', label: 'Same-Day Delivery', subtitle: 'Order before 12pm', price: 10000, display: null  },
];

const Spinner = () => (
    <svg className="w-4 h-4 animate-spin flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const ErrorNote = ({ message }) => (
    <p className="text-xs text-red-500 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg p-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {message}
    </p>
);

const ConfigError = ({ gateway }) => (
    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <strong>{gateway} public key is not configured.</strong> Add it to your <code>.env</code> or save it in Admin → Settings → Payment.
    </div>
);

const CardBrandIcon = ({ brand }) => {
    const b = brand?.toLowerCase();
    if (b === 'visa') return (
        <svg viewBox="0 0 48 48" className="w-7 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="6" fill="#1A1F71"/>
            <path d="M19.5 31H16L18.5 17H22L19.5 31Z" fill="white"/>
            <path d="M30.5 17.3C29.7 17 28.5 16.7 27 16.7C23.6 16.7 21.2 18.5 21.2 21C21.2 22.9 22.9 24 24.2 24.6C25.5 25.2 26 25.6 26 26.2C26 27 25 27.5 24.1 27.5C22.8 27.5 22.1 27.3 21 26.8L20.5 26.6L20 29.7C20.9 30.1 22.5 30.5 24.2 30.5C27.8 30.5 30.1 28.7 30.1 26C30.1 24.5 29.2 23.3 27.2 22.3C26 21.7 25.3 21.3 25.3 20.7C25.3 20.1 26 19.5 27.3 19.5C28.4 19.5 29.2 19.7 29.8 20L30.1 20.1L30.5 17.3Z" fill="white"/>
            <path d="M35 17H32.3C31.5 17 30.9 17.2 30.6 18.1L25.7 31H29.3L30 29H34.3L34.7 31H38L35 17ZM31 26.3L32.5 22.2L33.5 26.3H31Z" fill="white"/>
            <path d="M15.4 17L12 26.4L11.6 24.4C10.9 22.3 9 20 6.8 18.8L9.9 31H13.5L19.1 17H15.4Z" fill="white"/>
            <path d="M8.8 17H3.1L3 17.3C7.5 18.4 10.5 21 11.6 24.4L10.5 18.1C10.3 17.2 9.7 17 8.8 17Z" fill="#FAA61A"/>
        </svg>
    );
    if (b === 'mastercard') return (
        <svg viewBox="0 0 48 48" className="w-7 h-4" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="6" fill="#252525"/>
            <circle cx="18" cy="24" r="10" fill="#EB001B"/>
            <circle cx="30" cy="24" r="10" fill="#F79E1B"/>
            <path d="M24 16.3A10 10 0 0130 24a10 10 0 01-6 7.7A10 10 0 0118 24a10 10 0 016-7.7z" fill="#FF5F00"/>
        </svg>
    );
    return (
        <div className="w-7 h-4 bg-gray-200 rounded flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        </div>
    );
};

function StepIndicator({ step }) {
    const steps = ['Shipping', 'Payment', 'Confirmation'];
    return (
        <div className="flex items-center justify-center mb-10">
            {steps.map((label, i) => {
                const done   = step > i + 1;
                const active = step === i + 1;
                return (
                    <div key={label} className="flex items-center">
                        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5">
                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all flex-shrink-0
                                ${done   ? 'bg-green-500 text-white'
                                : active ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/25'
                                :          'bg-gray-100 text-gray-400'}`}>
                                {done ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : i + 1}
                            </div>
                            <span className={`text-xs sm:text-sm font-medium text-center leading-tight
                                ${active ? 'text-gray-900 font-semibold' : done ? 'text-gray-500' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`w-8 sm:w-16 lg:w-24 h-0.5 mx-2 sm:mx-3 transition-colors flex-shrink-0 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

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
                    { label: 'Subtotal',                value: formatCurrency(cart.subtotal) },
                    { label: 'Shipping',                value: shipping === 0 ? 'Free' : formatCurrency(shipping), green: shipping === 0 },
                    { label: `Tax (${cart.tax_rate}%)`, value: formatCurrency(cart.tax) },
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

function ShippingStep({ data, setData, errors, savedAddresses, onContinue }) {
    const setField = (path, value) => {
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
            full_name:      addr.full_name      ?? '',
            address_line_1: addr.address_line_1 ?? '',
            address_line_2: addr.address_line_2 ?? '',
            city:           addr.city           ?? '',
            state:          addr.state          ?? '',
            zip_code:       addr.zip_code       ?? '',
            phone:          addr.phone          ?? '',
        },
    }));

    return (
        <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Contact Information</h2>
                <TextInput type="email" placeholder="Email address" value={data.email}
                    onChange={e => setField('email', e.target.value)} error={errors.email} />
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
                                <p className="text-xs text-gray-500 mt-0.5">{addr.address_line_1}, {addr.city}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-3">
                    <TextInput placeholder="Full name"      value={data.shipping.full_name}      onChange={e => setField('shipping.full_name', e.target.value)}      error={errors['shipping.full_name']} />
                    <TextInput placeholder="Address line 1" value={data.shipping.address_line_1} onChange={e => setField('shipping.address_line_1', e.target.value)} error={errors['shipping.address_line_1']} />
                    <TextInput placeholder="Address line 2 (optional)" value={data.shipping.address_line_2} onChange={e => setField('shipping.address_line_2', e.target.value)} />
                    <div className="grid grid-cols-3 gap-3">
                        <TextInput placeholder="City"     value={data.shipping.city}     onChange={e => setField('shipping.city', e.target.value)}     error={errors['shipping.city']} />
                        <TextInput placeholder="State"    value={data.shipping.state}    onChange={e => setField('shipping.state', e.target.value)}    error={errors['shipping.state']} />
                        <TextInput placeholder="ZIP code" value={data.shipping.zip_code} onChange={e => setField('shipping.zip_code', e.target.value)} error={errors['shipping.zip_code']} />
                    </div>
                    <TextInput placeholder="Phone number" value={data.shipping.phone} onChange={e => setField('shipping.phone', e.target.value)} error={errors['shipping.phone']} />
                    <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                        <input type="checkbox" checked={data.save_address} onChange={e => setField('save_address', e.target.checked)}
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

function StripeNewCardForm({ publicKey, shippingMethod, onSuccess }) {
    const mountRef       = useRef(null);
    const stripeRef      = useRef(null);
    const cardRef        = useRef(null);
    const [ready,      setReady]      = useState(false);
    const [cardError,  setCardError]  = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!mountRef.current) return;
        stripeRef.current = window.Stripe(publicKey);
        const elements    = stripeRef.current.elements();
        cardRef.current   = elements.create('card', {
            style: {
                base:    { fontSize: '14px', color: '#111827', fontFamily: 'inherit', '::placeholder': { color: '#9ca3af' } },
                invalid: { color: '#ef4444' },
            },
        });
        cardRef.current.mount(mountRef.current);
        cardRef.current.on('ready',  ()  => setReady(true));
        cardRef.current.on('change', (e) => setCardError(e.error?.message ?? ''));
        return () => { cardRef.current?.unmount(); cardRef.current = null; };
    }, []);

    const pay = async () => {
        if (!stripeRef.current || !cardRef.current || !ready) return;
        setProcessing(true);
        setCardError('');
        try {
            const { data } = await axios.post(route('checkout.stripe-intent'), { shipping_method: shippingMethod });
            const { error, paymentIntent } = await stripeRef.current.confirmCardPayment(data.client_secret, {
                payment_method: { card: cardRef.current },
            });
            if (error) { setCardError(error.message); setProcessing(false); return; }
            if (paymentIntent.status === 'succeeded') { onSuccess({ payment_intent_id: paymentIntent.id }); }
            else { setCardError('Payment was not completed. Please try again.'); setProcessing(false); }
        } catch (err) {
            setCardError(err.response?.data?.error ?? err.message ?? 'Something went wrong. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[52px] relative">
                <div ref={mountRef} className="py-1" />
                {!ready && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl">
                        <Spinner /> Loading secure card form...
                    </div>
                )}
            </div>
            {cardError && <ErrorNote message={cardError} />}
            <button onClick={pay} disabled={processing || !ready}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm shadow-lg shadow-primary-900/20">
                {processing ? <Spinner /> : <LockIcon />}
                {processing ? 'Processing...' : 'Pay with Card'}
            </button>
        </div>
    );
}

function StripeSavedCardForm({ publicKey, selectedCardId, shippingMethod, onSuccess }) {
    const stripeRef              = useRef(null);
    const [error,      setError]      = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => { stripeRef.current = window.Stripe(publicKey); }, []);

    const pay = async () => {
        if (!stripeRef.current || !selectedCardId) return;
        setProcessing(true);
        setError('');
        try {
            const { data } = await axios.post(route('checkout.stripe-intent'), { shipping_method: shippingMethod });
            const { error: stripeError, paymentIntent } = await stripeRef.current.confirmCardPayment(
                data.client_secret, { payment_method: selectedCardId }
            );
            if (stripeError) { setError(stripeError.message); setProcessing(false); return; }
            if (paymentIntent.status === 'succeeded') { onSuccess({ payment_intent_id: paymentIntent.id }); }
            else { setError('Payment not completed. Please try again.'); setProcessing(false); }
        } catch (err) {
            setError(err.response?.data?.error ?? err.message ?? 'Something went wrong.');
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-3">
            {error && <ErrorNote message={error} />}
            <button onClick={pay} disabled={processing || !selectedCardId}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm shadow-lg shadow-primary-900/20">
                {processing ? <Spinner /> : <LockIcon />}
                {processing ? 'Processing...' : 'Pay Now'}
            </button>
        </div>
    );
}

function PaymentStep({
    data, setData, errors, setErrors, cart,
    gateways, stripePublicKey, paystackPublicKey,
    stripeReady, paystackReady,
    savedCards, defaultCardId,
    onBack, onSubmit, onPaystack, processing,
}) {
    const [selectedSavedCardId, setSelectedSavedCardId] = useState(defaultCardId ?? savedCards[0]?.id ?? null);
    const [useNewCard,           setUseNewCard]           = useState(savedCards.length === 0);

    const shippingCost = data.shipping_method === 'standard'
        ? cart.shipping
        : (SHIPPING_METHODS.find(m => m.id === data.shipping_method)?.price ?? 0);
    const total = cart.subtotal + shippingCost + cart.tax - cart.discount;

    const selectPayment = (value) => {
        setErrors(e => ({ ...e, payment: undefined }));
        setData(p => ({ ...p, payment_method: value }));
    };

    return (
        <div className="space-y-5">

            {/* Shipping method */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Shipping Method</h2>
                <div className="space-y-3">
                    {SHIPPING_METHODS.map(method => {
                        const isSelected = data.shipping_method === method.id;
                        const cost       = method.id === 'standard' ? cart.shipping : method.price;
                        return (
                            <label key={method.id}
                                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                                    ${isSelected ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="shipping_method" value={method.id} checked={isSelected}
                                    onChange={() => setData(p => ({ ...p, shipping_method: method.id }))}
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
                    <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
                        No payment methods are currently enabled. Please contact the store.
                    </p>
                )}

                <div className="space-y-3">
                    {gateways.stripe && (
                        <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                            ${data.payment_method === 'stripe' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="payment_method" value="stripe" checked={data.payment_method === 'stripe'}
                                onChange={() => selectPayment('stripe')}
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
                                onChange={() => selectPayment('paystack')}
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
                                onChange={() => selectPayment('cod')}
                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-900">Cash on Delivery</span>
                        </label>
                    )}
                </div>

                {/* Stripe inline card form */}
                {data.payment_method === 'stripe' && (
                    <div className="mt-5">
                        {!stripePublicKey ? (
                            <ConfigError gateway="Stripe" />
                        ) : !stripeReady ? (
                            <div className="flex items-center gap-2.5 text-sm text-gray-500 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <Spinner /> Loading secure payment form...
                            </div>
                        ) : (
                            <>
                                {savedCards.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Saved Cards</p>
                                        {savedCards.map(card => (
                                            <label key={card.id}
                                                className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all
                                                    ${!useNewCard && selectedSavedCardId === card.id
                                                        ? 'border-primary-600 bg-primary-50/30'
                                                        : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input type="radio" checked={!useNewCard && selectedSavedCardId === card.id}
                                                    onChange={() => { setUseNewCard(false); setSelectedSavedCardId(card.id); }}
                                                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                                <div className="w-10 h-7 bg-gray-50 rounded border border-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <CardBrandIcon brand={card.brand} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900">{card.brand} •••• {card.last4}</p>
                                                    <p className="text-xs text-gray-400">Exp {card.exp_month}/{card.exp_year}</p>
                                                </div>
                                                {card.is_default && (
                                                    <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">Default</span>
                                                )}
                                            </label>
                                        ))}
                                        <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all
                                            ${useNewCard ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" checked={useNewCard} onChange={() => setUseNewCard(true)}
                                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700">Use a different card</span>
                                        </label>
                                    </div>
                                )}
                                {useNewCard
                                    ? <StripeNewCardForm publicKey={stripePublicKey} shippingMethod={data.shipping_method} onSuccess={onSubmit} />
                                    : <StripeSavedCardForm publicKey={stripePublicKey} selectedCardId={selectedSavedCardId} shippingMethod={data.shipping_method} onSuccess={onSubmit} />
                                }
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Terms */}
            <div className={`flex items-start gap-3 p-4 bg-white border-2 rounded-2xl transition-colors ${errors.agreed_to_terms ? 'border-red-300' : 'border-gray-100'}`}>
                <input type="checkbox" id="terms" checked={data.agreed_to_terms}
                    onChange={e => setData(p => ({ ...p, agreed_to_terms: e.target.checked }))}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer flex-shrink-0" />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                    I agree to the{' '}
                    <Link href="#" className="text-primary-600 hover:underline font-medium">Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link href="#" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
                </label>
            </div>
            {errors.agreed_to_terms && <p className="text-xs text-red-500 -mt-3">{errors.agreed_to_terms}</p>}
            {errors.payment && <ErrorNote message={errors.payment} />}

            {/* COD */}
            {data.payment_method === 'cod' && (
                <div className="flex items-center gap-3">
                    <button onClick={onBack}
                        className="px-6 py-4 text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                        Back
                    </button>
                    <button onClick={() => onSubmit({})} disabled={processing}
                        className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 disabled:opacity-60 transition-colors text-sm shadow-lg shadow-primary-900/20">
                        {processing && <Spinner />}
                        {processing ? 'Placing Order...' : `Place Order · ${formatCurrency(total)}`}
                    </button>
                </div>
            )}

            {/* Paystack */}
            {data.payment_method === 'paystack' && (
                <div className="flex items-center gap-3">
                    <button onClick={onBack}
                        className="px-6 py-4 text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                        Back
                    </button>
                    {!paystackPublicKey ? (
                        <div className="flex-1"><ConfigError gateway="Paystack" /></div>
                    ) : (
                        <button onClick={onPaystack} disabled={!paystackReady || processing}
                            className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-[#0BA4DB] text-white font-bold rounded-2xl hover:bg-[#0993c5] disabled:opacity-60 transition-colors text-sm shadow-lg">
                            {(!paystackReady || processing) && <Spinner />}
                            {!paystackReady ? 'Loading Paystack...' : processing ? 'Processing...' : `Pay ${formatCurrency(total)} with Paystack`}
                        </button>
                    )}
                </div>
            )}

            {/* Stripe: pay button lives inside the card form, just need Back here */}
            {data.payment_method === 'stripe' && (
                <button onClick={onBack}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                    ← Back
                </button>
            )}
        </div>
    );
}

export default function Index({
    cart,
    savedAddresses,
    userEmail,
    gateways,
    stripePublicKey,
    paystackPublicKey,
    savedCards    = [],
    defaultCardId = null,
}) {
    const [step,       setStep]       = useState(1);
    const [processing, setProcessing] = useState(false);
    const [errors,     setErrors]     = useState({});
    const [stripeReady,   setStripeReady]   = useState(false);
    const [paystackReady, setPaystackReady] = useState(false);

    const defaultGateway = gateways.stripe ? 'stripe' : gateways.paystack ? 'paystack' : 'cod';

    const [data, setData] = useState({
        email:           userEmail ?? '',
        shipping: {
            full_name:      '',
            address_line_1: '',
            address_line_2: '',
            city:           '',
            state:          '',
            zip_code:       '',
            phone:          '',
        },
        save_address:    false,
        shipping_method: 'standard',
        payment_method:  defaultGateway,
        agreed_to_terms: false,
        notes:           '',
    });

    const dataRef = useRef(data);
    useEffect(() => { dataRef.current = data; }, [data]);

    useEffect(() => {
        if (!gateways.stripe) return;
        if (window.Stripe) { setStripeReady(true); return; }  
        const s   = document.createElement('script');
        s.src     = 'https://js.stripe.com/v3/';
        s.onload  = () => setStripeReady(true);
        s.onerror = () => console.error('[ShopStack] Stripe.js failed to load');
        document.head.appendChild(s);
    }, []);

    useEffect(() => {
        if (!gateways.paystack) return;
        if (window.PaystackPop) { setPaystackReady(true); return; } 
        const s   = document.createElement('script');
        s.src     = 'https://js.paystack.co/v1/inline.js';
        s.onload  = () => setPaystackReady(true);
        s.onerror = () => console.error('[ShopStack] Paystack.js failed to load');
        document.head.appendChild(s);
    }, []);

    const validateStep1 = () => {
        const e = {};
        if (!data.email)                   e.email                      = 'Email is required';
        if (!data.shipping.full_name)      e['shipping.full_name']      = 'Full name is required';
        if (!data.shipping.address_line_1) e['shipping.address_line_1'] = 'Address is required';
        if (!data.shipping.city)           e['shipping.city']           = 'City is required';
        if (!data.shipping.state)          e['shipping.state']          = 'State is required';
        if (!data.shipping.zip_code)       e['shipping.zip_code']       = 'ZIP code is required';
        if (!data.shipping.phone)          e['shipping.phone']          = 'Phone is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submitOrder = (extra = {}) => {
        const current = dataRef.current;
        if (!current.agreed_to_terms) {
            setErrors(e => ({ ...e, agreed_to_terms: 'You must agree to the terms to continue' }));
            return;
        }
        setProcessing(true);
        router.post(route('checkout.store'), { ...current, ...extra }, {
            onError:  (e) => { setErrors(e); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    const openPaystack = () => {
        const current = dataRef.current;
        if (!current.agreed_to_terms) {
            setErrors(e => ({ ...e, agreed_to_terms: 'You must agree to the terms to continue' }));
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
            ref:      `PSK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            onSuccess: (transaction) => {
                setProcessing(true);
                router.post(
                    route('checkout.paystack'),
                    {
                        ...dataRef.current,
                        payment_method:     'paystack',
                        paystack_reference: transaction.reference,
                        agreed_to_terms:    true,
                    },
                    {
                        onError:  (e) => { setErrors(e); setProcessing(false); },
                        onFinish: () => setProcessing(false),
                    }
                );
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
                                    data={data} setData={setData} errors={errors} setErrors={setErrors}
                                    cart={cart}
                                    gateways={gateways}
                                    stripePublicKey={stripePublicKey}
                                    paystackPublicKey={paystackPublicKey}
                                    stripeReady={stripeReady}
                                    paystackReady={paystackReady}
                                    savedCards={savedCards}
                                    defaultCardId={defaultCardId}
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