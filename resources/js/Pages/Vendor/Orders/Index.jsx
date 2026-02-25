import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import { StatusBadge, SelectInput, StatCard } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

export default function Index({ orders, filters, stats }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key, value) => {
        router.get(
            route('vendor.orders.index'),
            { ...filters, [key]: value || undefined, page: undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    return (
        <VendorLayout>
            <Head title="Orders" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Orders"
                        value={stats.total}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Processing"
                        value={stats.processing}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Shipped"
                        value={stats.shipped}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                        }
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by order number or customer..."
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </form>

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
                            ]}
                            className="sm:w-44"
                        />

                        <SelectInput
                            value={filters.payment_status ?? ''}
                            onChange={(e) => applyFilter('payment_status', e.target.value)}
                            placeholder="All Payments"
                            options={[
                                { value: 'pending',  label: 'Pending'  },
                                { value: 'paid',     label: 'Paid'     },
                                { value: 'failed',   label: 'Failed'   },
                                { value: 'refunded', label: 'Refunded' },
                            ]}
                            className="sm:w-44"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    {['Order', 'Customer', 'Your Items', 'Your Subtotal', 'Order Status', 'Payment', 'Date', 'Actions'].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 7 ? 'text-right' : 'text-left'}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Order number */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-gray-900">{order.order_number}</span>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-800">{order.customer.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{order.customer.email}</p>
                                            </td>

                                            {/* Vendor item count */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {order.vendor_items_count} {order.vendor_items_count === 1 ? 'item' : 'items'}
                                                </span>
                                            </td>

                                            {/* Vendor subtotal */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(order.vendor_subtotal)}
                                                </span>
                                            </td>

                                            {/* Order status */}
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>

                                            {/* Payment status */}
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.payment_status} />
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-500">{order.created_at}</span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end">
                                                    <Link
                                                        href={route('vendor.orders.show', order.id)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                                        title="View"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-500">No orders found</p>
                                                <p className="text-xs text-gray-400">Orders for your products will appear here</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-medium">{orders.from}</span>–<span className="font-medium">{orders.to}</span> of <span className="font-medium">{orders.total}</span>
                            </p>
                            <div className="flex items-center gap-1">
                                {orders.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-primary-600 text-white font-medium'
                                                : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </VendorLayout>
    );
}