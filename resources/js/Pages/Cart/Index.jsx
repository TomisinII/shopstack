import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConfirmModal from '@/Components/ConfirmModal';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

// ─── Cart Item Row ────────────────────────────────────────────────────────────

function CartItemRow({ item }) {
    const [qty, setQty] = useState(item.quantity);
    const [removing, setRemoving] = useState(false);

    const updateQty = (newQty) => {
        if (newQty < 1) return;
        setQty(newQty);
        router.patch(route('cart.update', item.id), { quantity: newQty }, { preserveScroll: true });
    };

    const remove = () => {
        setRemoving(true);
        router.delete(route('cart.remove', item.id), { preserveScroll: true });
    };

    return (
        <div className={`flex items-start gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm transition-opacity ${removing ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Image */}
            <Link href={item.slug ? route('shop.show', item.slug) : '#'} className="flex-shrink-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <Link href={item.slug ? route('shop.show', item.slug) : '#'}
                    className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                    {item.name}
                </Link>
                {item.variant && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.variant}</p>
                )}
                {item.sku && (
                    <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                )}

                {/* Quantity stepper */}
                <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => updateQty(qty - 1)}
                            disabled={qty <= 1}
                            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
                        >
                            −
                        </button>
                        <span className="w-10 h-9 flex items-center justify-center text-sm font-bold text-gray-900 border-x-2 border-gray-200">
                            {qty}
                        </span>
                        <button
                            onClick={() => updateQty(qty + 1)}
                            disabled={qty >= item.max_quantity}
                            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* Price + Remove */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <button onClick={remove} className="text-gray-300 hover:text-red-400 transition-colors" aria-label="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(item.subtotal)}</span>
                {qty > 1 && (
                    <span className="text-xs text-gray-400">{formatCurrency(item.price)} each</span>
                )}
            </div>
        </div>
    );
}

// ─── Order Summary ────────────────────────────────────────────────────────────

function OrderSummary({ cart, coupon: savedCoupon }) {
    const { data, setData, post, processing, errors, reset } = useForm({ coupon: '' });
    const [removingCoupon, setRemovingCoupon] = useState(false);

    const applyCoupon = (e) => {
        e.preventDefault();
        post(route('cart.coupon.apply'), { preserveScroll: true, onSuccess: () => reset() });
    };

    const removeCoupon = () => {
        setRemovingCoupon(true);
        router.delete(route('cart.coupon.remove'), {
            preserveScroll: true,
            onFinish: () => setRemovingCoupon(false),
        });
    };

    const Row = ({ label, value, bold, green, red }) => (
        <div className={`flex items-center justify-between ${bold ? 'pt-3 border-t border-gray-100' : ''}`}>
            <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{label}</span>
            <span className={`text-sm font-semibold ${bold ? 'text-lg text-gray-900' : ''} ${green ? 'text-green-600' : ''} ${red ? 'text-red-500' : ''}`}>
                {value}
            </span>
        </div>
    );

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
                <Row label="Subtotal" value={formatCurrency(cart.subtotal)} />
                <Row label="Shipping" value={cart.free_shipping ? 'Free' : formatCurrency(cart.shipping)} green={cart.free_shipping} />
                <Row label="Tax (8%)" value={formatCurrency(cart.tax)} />
                {cart.discount > 0 && (
                    <Row label={`Discount${cart.coupon ? ` (${cart.coupon.code})` : ''}`} value={`− ${formatCurrency(cart.discount)}`} red />
                )}
                <Row label="Total" value={formatCurrency(cart.total)} bold />
            </div>

            {/* Coupon */}
            <div className="mb-5">
                {cart.coupon ? (
                    <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-green-700">{cart.coupon.code}</span>
                            <span className="text-xs text-green-600">applied</span>
                        </div>
                        <button onClick={removeCoupon} disabled={removingCoupon}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                            Remove
                        </button>
                    </div>
                ) : (
                    <form onSubmit={applyCoupon} className="flex gap-2">
                        <input
                            type="text"
                            value={data.coupon}
                            onChange={e => setData('coupon', e.target.value)}
                            placeholder="Coupon code"
                            className={`flex-1 px-3 py-2.5 text-sm border rounded-xl outline-none transition-colors ${errors.coupon ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-primary-400'}`}
                        />
                        <button type="submit" disabled={processing || !data.coupon}
                            className="px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors flex-shrink-0">
                            Apply
                        </button>
                    </form>
                )}
                {errors.coupon && <p className="text-xs text-red-500 mt-1.5">{errors.coupon}</p>}
            </div>

            {/* Checkout */}
            <Link
                href={route('checkout.index')}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors text-sm shadow-lg shadow-primary-900/20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Checkout · {formatCurrency(cart.total)}
            </Link>

            {/* Trust icons */}
            <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-100">
                {[
                    { d: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0', tip: 'Free Shipping' },
                    { d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', tip: '30-Day Returns' },
                    { d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', tip: 'Secure Checkout' },
                ].map(({ d, tip }) => (
                    <div key={tip} title={tip} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Index({ cart, coupon }) {
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearing, setClearing] = useState(false);

    const clearCart = () => {
        setClearing(true);
        router.delete(route('cart.clear'), {
            preserveScroll: true,
            onFinish: () => {
                setClearing(false);
                setShowClearModal(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Shopping Cart — ShopStack" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                {cart.items.length === 0 ? (
                    /* ── Empty state ─────────────────────────────────── */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-sm text-gray-500 mb-7 max-w-xs">
                            Looks like you haven't added anything yet. Start shopping to fill it up!
                        </p>
                        <Link href={route('shop.index')}
                            className="px-7 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* ── Left: Items ───────────────────────────── */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map(item => (
                                <CartItemRow key={item.id} item={item} />
                            ))}

                            {/* Footer row */}
                            <div className="flex items-center justify-between pt-2">
                                <Link href={route('shop.index')}
                                    className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Continue Shopping
                                </Link>
                                <button onClick={() => setShowClearModal(true)}
                                    className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
                                    Clear Cart
                                </button>
                            </div>
                        </div>

                        {/* ── Right: Order Summary ──────────────────── */}
                        <div className="lg:col-span-1">
                            <OrderSummary cart={cart} coupon={coupon} />
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={clearCart}
                title="Clear Cart"
                message="Are you sure you want to remove all items from your cart? This action cannot be undone."
                confirmText="Clear Cart"
                loading={clearing}
            />
        </AppLayout>
    );
}