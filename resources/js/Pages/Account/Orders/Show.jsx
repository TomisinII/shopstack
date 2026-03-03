import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { StatusBadge, SectionCard, InfoRow } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const TIMELINE_STEPS = [
    {
        key: 'pending',
        label: 'Order Placed',
        description: 'Your order has been received',
        icon: (active) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        key: 'processing',
        label: 'Processing',
        description: 'We\'re preparing your items',
        icon: (active) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
    },
    {
        key: 'shipped',
        label: 'Shipped',
        description: 'Your order is on the way',
        icon: (active) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2M8 4v4l3-3 3 3V4M8 4h8" />
            </svg>
        ),
    },
    {
        key: 'delivered',
        label: 'Delivered',
        description: 'Package delivered successfully',
        icon: (active) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
];

export default function Show({ order }) {
    const [buyingAgain, setBuyingAgain] = useState(false);

    const isCancelledOrRefunded = ['cancelled', 'refunded'].includes(order.status);
    const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status);

    const handleBuyAgain = () => {
        setBuyingAgain(true);
        router.post(route('account.orders.buy-again', order.id), {}, {
            onFinish: () => setBuyingAgain(false),
        });
    };

    const shippingLines = [
        order.shipping_address_line_1,
        order.shipping_address_line_2,
        [order.shipping_city, order.shipping_state, order.shipping_zip].filter(Boolean).join(', '),
        order.shipping_country,
    ].filter(Boolean);

    const billingLines = order.billing_full_name ? [
        order.billing_address_line_1,
        [order.billing_city, order.billing_state, order.billing_zip].filter(Boolean).join(', '),
        order.billing_country,
    ].filter(Boolean) : null;

    return (
        <CustomerLayout>
            <Head title={`Order ${order.order_number}`} />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('account.orders.index')}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1>
                                <StatusBadge status={order.status} />
                                <StatusBadge status={order.payment_status} />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">Placed on {order.created_at}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleBuyAgain}
                            disabled={buyingAgain}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 hover:border-primary-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {buyingAgain ? (
                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            )}
                            {buyingAgain ? 'Adding to Cart...' : 'Buy Again'}
                        </button>

                        <Link
                            href={route('shop.index')}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* Status Timeline */}
                {!isCancelledOrRefunded && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-6">Order Progress</h3>
                        <div className="relative">
                            {/* connector line */}
                            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" />
                            <div
                                className="absolute top-4 left-4 h-0.5 bg-primary-600 transition-all"
                                style={{
                                    width: currentStepIndex <= 0 ? '0%'
                                        : `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%`
                                }}
                            />
                            <div className="relative flex justify-between">
                                {TIMELINE_STEPS.map((step, i) => {
                                    const done   = i <= currentStepIndex;
                                    const active = i === currentStepIndex;
                                    return (
                                        <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                                                active ? 'bg-primary-600 border-primary-600 shadow-md shadow-primary-100'
                                                : done  ? 'bg-primary-600 border-primary-600'
                                                : 'bg-white border-gray-200'
                                            }`}>
                                                {step.icon(done)}
                                            </div>
                                            <div className="text-center px-1">
                                                <p className={`text-xs font-semibold ${done ? 'text-primary-600' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                                <p className="text-[10px] text-gray-400 hidden sm:block mt-0.5">{step.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tracking number */}
                        {order.tracking_number && (
                            <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span className="text-xs text-gray-500">Tracking number:</span>
                                <span className="text-xs font-semibold text-gray-900 font-mono">{order.tracking_number}</span>
                            </div>
                        )}

                        {/* Dates */}
                        {(order.shipped_at || order.delivered_at) && (
                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                                {order.shipped_at && (
                                    <span>Shipped: <span className="text-gray-600 font-medium">{order.shipped_at}</span></span>
                                )}
                                {order.delivered_at && (
                                    <span>Delivered: <span className="text-gray-600 font-medium">{order.delivered_at}</span></span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left — Items + Addresses */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Items Ordered <span className="text-gray-400 font-normal">({order.items.length})</span>
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.items.map((item) => (
                                    <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                                        {/* Image */}
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                            {item.thumbnail ? (
                                                <img src={item.thumbnail} alt={item.product_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            {item.product_slug ? (
                                                <Link
                                                    href={route('shop.show', item.product_slug)}
                                                    className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                                                >
                                                    {item.product_name}
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product_name}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                {item.product_sku && (
                                                    <span className="text-xs text-gray-400 font-mono">{item.product_sku}</span>
                                                )}
                                                {item.variant_name && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {item.variant_name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatCurrency(item.unit_price)} × {item.quantity}
                                            </p>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Shipping */}
                            <SectionCard title="Shipping Address">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-900">{order.shipping_full_name}</p>
                                    {order.shipping_phone && (
                                        <p className="text-xs text-gray-500">{order.shipping_phone}</p>
                                    )}
                                    {shippingLines.map((line, i) => (
                                        <p key={i} className="text-xs text-gray-600">{line}</p>
                                    ))}
                                </div>
                            </SectionCard>

                            {/* Billing */}
                            <SectionCard title="Billing Address">
                                {billingLines ? (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-900">{order.billing_full_name}</p>
                                        {billingLines.map((line, i) => (
                                            <p key={i} className="text-xs text-gray-600">{line}</p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400">Same as shipping address</p>
                                )}
                            </SectionCard>
                        </div>

                        {/* Customer Notes */}
                        {order.customer_notes && (
                            <SectionCard title="Order Notes">
                                <p className="text-sm text-gray-600">{order.customer_notes}</p>
                            </SectionCard>
                        )}
                    </div>

                    {/* Right — Summary */}
                    <div className="space-y-6">

                        {/* Order Summary */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900">Order Summary</h3>
                            </div>
                            <div className="p-6 space-y-0">
                                <InfoRow label="Subtotal"  value={formatCurrency(order.subtotal)} />
                                <InfoRow label="Shipping"  value={order.shipping_cost > 0 ? formatCurrency(order.shipping_cost) : 'Free'} />
                                {order.tax_amount > 0 && (
                                    <InfoRow label="Tax" value={formatCurrency(order.tax_amount)} />
                                )}
                                {order.discount_amount > 0 && (
                                    <InfoRow
                                        label="Discount"
                                        value={
                                            <span className="text-green-600 font-medium">
                                                -{formatCurrency(order.discount_amount)}
                                                {order.coupon_code && (
                                                    <span className="ml-1.5 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-mono">
                                                        {order.coupon_code}
                                                    </span>
                                                )}
                                            </span>
                                        }
                                    />
                                )}
                                <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">Total</span>
                                    <span className="text-base font-bold text-gray-900">{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <SectionCard title="Payment">
                            <dl>
                                <InfoRow label="Method"  value={<span className="capitalize">{order.payment_method?.replace('_', ' ')}</span>} />
                                <InfoRow label="Status"  value={<StatusBadge status={order.payment_status} />} />
                            </dl>
                        </SectionCard>

                        {/* Cancelled / Refunded banner */}
                        {isCancelledOrRefunded && (
                            <div className={`rounded-xl p-4 border ${
                                order.status === 'cancelled'
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 flex-shrink-0 ${order.status === 'cancelled' ? 'text-red-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className={`text-xs font-semibold capitalize ${order.status === 'cancelled' ? 'text-red-700' : 'text-gray-700'}`}>
                                        This order was {order.status}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-2">
                            <button
                                onClick={handleBuyAgain}
                                disabled={buyingAgain}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {buyingAgain ? (
                                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                                {buyingAgain ? 'Adding to Cart...' : 'Buy Again'}
                            </button>

                            <Link
                                href={route('account.orders.index')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}