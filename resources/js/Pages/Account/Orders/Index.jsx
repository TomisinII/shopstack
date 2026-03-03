import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { StatusBadge, SelectInput } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const PaymentMethodIcon = ({ method }) => {
    if (method === 'stripe') return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
        </svg>
    );
    if (method === 'paystack') return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h16v3H4zm0 6.5h16v3H4zm0 6.5h16v3H4z"/>
        </svg>
    );
    // cod
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
};

const OrderStatusTimeline = ({ status }) => {
    const steps = [
        { key: 'pending',    label: 'Ordered'    },
        { key: 'processing', label: 'Processing' },
        { key: 'shipped',    label: 'Shipped'    },
        { key: 'delivered',  label: 'Delivered'  },
    ];

    const cancelledOrRefunded = ['cancelled', 'refunded'].includes(status);
    const currentIndex = steps.findIndex((s) => s.key === status);

    return (
        <div className="flex items-center gap-1 mt-3">
            {steps.map((step, i) => {
                const done = cancelledOrRefunded ? false : i <= currentIndex;
                const active = !cancelledOrRefunded && i === currentIndex;

                return (
                    <div key={step.key} className="flex items-center gap-1 flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                active ? 'bg-primary-600 ring-2 ring-primary-200'
                                : done  ? 'bg-primary-600'
                                : 'bg-gray-200'
                            }`} />
                            <span className={`text-[10px] whitespace-nowrap ${
                                active ? 'text-primary-600 font-semibold'
                                : done  ? 'text-gray-500'
                                : 'text-gray-400'
                            }`}>{step.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`flex-1 h-px mb-3 ${done && i < currentIndex ? 'bg-primary-600' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
            {cancelledOrRefunded && (
                <span className="text-[10px] font-semibold text-red-500 capitalize">{status}</span>
            )}
        </div>
    );
};

export default function Index({ orders, filters }) {
    const [buyingAgain, setBuyingAgain] = useState(null);

    const applyFilter = (key, value) => {
        router.get(route('account.orders.index'), { ...filters, [key]: value || undefined, page: undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleBuyAgain = (orderId) => {
        setBuyingAgain(orderId);
        router.post(route('account.orders.buy-again', orderId), {}, {
            onFinish: () => setBuyingAgain(null),
        });
    };

    const hasOrders = orders.data.length > 0;

    return (
        <CustomerLayout>
            <Head title="My Orders" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{orders.total} order{orders.total !== 1 ? 's' : ''} placed</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SelectInput
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilter('status', e.target.value)}
                            placeholder="All Statuses"
                            options={[
                                { value: 'pending',    label: 'Pending'    },
                                { value: 'processing', label: 'Processing' },
                                { value: 'shipped',    label: 'Shipped'    },
                                { value: 'delivered',  label: 'Delivered'  },
                                { value: 'cancelled',  label: 'Cancelled'  },
                                { value: 'refunded',   label: 'Refunded'   },
                            ]}
                            className="sm:w-48"
                        />
                        <SelectInput
                            value={filters.payment_status ?? ''}
                            onChange={(e) => applyFilter('payment_status', e.target.value)}
                            placeholder="All Payments"
                            options={[
                                { value: 'paid',     label: 'Paid'    },
                                { value: 'pending',  label: 'Pending' },
                                { value: 'failed',   label: 'Failed'  },
                                { value: 'refunded', label: 'Refunded'},
                            ]}
                            className="sm:w-48"
                        />
                        {(filters.status || filters.payment_status) && (
                            <button
                                onClick={() => router.get(route('account.orders.index'), {}, { replace: true })}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Orders List */}
                {hasOrders ? (
                    <div className="space-y-4">
                        {orders.data.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                                {/* Card Header */}
                                <div className="px-5 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {/* Order icon */}
                                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-gray-900">{order.order_number}</span>
                                                <StatusBadge status={order.status} />
                                                <StatusBadge status={order.payment_status} />
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {order.created_at}
                                                <span className="text-gray-200">·</span>
                                                <PaymentMethodIcon method={order.payment_method} />
                                                <span className="capitalize">{order.payment_method?.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-base font-bold text-gray-900">{formatCurrency(order.total)}</p>
                                            <p className="text-xs text-gray-400">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Product thumbnails */}
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        {/* Thumbnails */}
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="relative flex-shrink-0">
                                                    <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                                        {item.thumbnail ? (
                                                            <img src={item.thumbnail} alt={item.product_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* qty badge */}
                                                    {item.quantity > 1 && (
                                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                                            {item.quantity}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {order.extra_items_count > 0 && (
                                                <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-semibold text-gray-500">+{order.extra_items_count}</span>
                                                </div>
                                            )}

                                            {/* First item name on wider screens */}
                                            <div className="hidden sm:block min-w-0 ml-1">
                                                <p className="text-sm font-medium text-gray-800 truncate">{order.items[0]?.product_name}</p>
                                                {order.items_count > 1 && (
                                                    <p className="text-xs text-gray-400">and {order.items_count - 1} more item{order.items_count - 1 !== 1 ? 's' : ''}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Buy Again */}
                                            <button
                                                onClick={() => handleBuyAgain(order.id)}
                                                disabled={buyingAgain === order.id}
                                                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 hover:border-primary-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {buyingAgain === order.id ? (
                                                    <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                )}
                                                {buyingAgain === order.id ? 'Adding...' : 'Buy Again'}
                                            </button>

                                            {/* View Details */}
                                            <Link
                                                href={route('account.orders.show', order.id)}
                                                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Details
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Mini status timeline */}
                                    {!['cancelled', 'refunded'].includes(order.status) && (
                                        <OrderStatusTimeline status={order.status} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-gray-700">No orders found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {filters.status || filters.payment_status
                                ? 'Try adjusting your filters'
                                : "You haven't placed any orders yet"}
                        </p>
                        <Link
                            href={route('shop.index')}
                            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Start Shopping
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium">{orders.from}</span>–<span className="font-medium">{orders.to}</span> of <span className="font-medium">{orders.total}</span> orders
                        </p>
                        <div className="flex items-center gap-1">
                            {orders.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                        link.active      ? 'bg-primary-600 text-white font-medium'
                                        : link.url       ? 'text-gray-600 hover:bg-gray-100'
                                        : 'text-gray-300 cursor-not-allowed pointer-events-none'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}