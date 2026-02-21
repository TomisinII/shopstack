import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { StatusBadge } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const STATUS_TABS = [
    { label: 'All',        value: ''           },
    { label: 'Pending',    value: 'pending'     },
    { label: 'Processing', value: 'processing'  },
    { label: 'Shipped',    value: 'shipped'     },
    { label: 'Delivered',  value: 'delivered'   },
    { label: 'Cancelled',  value: 'cancelled'   },
];

export default function Index({ orders, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key, value) => {
        router.get(
            route('admin.orders.index'),
            { ...filters, [key]: value || undefined, page: undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const handleTabChange = (value) => {
        router.get(
            route('admin.orders.index'),
            { ...filters, status: value || undefined, page: undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleExport = () => {
        const params = new URLSearchParams(
            Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
        );
        window.location.href = route('admin.orders.index') + '/export?' + params.toString();
    };

    const handlePrint = (orderId) => {
        window.open(route('admin.orders.show', orderId) + '?print=1', '_blank');
    };

    const handleEmail = (orderId) => {
        router.post(route('admin.orders.notify', orderId), {}, {
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    const activeTab = filters.status ?? '';

    return (
        <AdminLayout>
            <Head title="Orders" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                </div>

                {/* Flash */}
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        {flash.error}
                    </div>
                )}

                {/* Tab filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => handleTabChange(tab.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === tab.value
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Table card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-100">
                        <form onSubmit={handleSearch}>
                            <div className="relative max-w-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search orders..."
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    {['Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 6 ? 'text-right' : 'text-left'}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Order number */}
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={route('admin.orders.show', order.id)}
                                                    className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                                                >
                                                    {order.order_number}
                                                </Link>
                                                <p className="text-xs text-gray-400 mt-0.5">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</p>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-gray-900">{order.customer.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{order.customer.email}</p>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-500">{order.created_at}</span>
                                            </td>

                                            {/* Total */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</span>
                                            </td>

                                            {/* Payment */}
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.payment_status} />
                                            </td>

                                            {/* Order status */}
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* View */}
                                                    <Link
                                                        href={route('admin.orders.show', order.id)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                                        title="View order"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>

                                                    {/* Print */}
                                                    <button
                                                        onClick={() => handlePrint(order.id)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                                        title="Print packing slip"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                        </svg>
                                                    </button>

                                                    {/* Email */}
                                                    <button
                                                        onClick={() => handleEmail(order.id)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                                        title="Send notification email"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-500">No orders found</p>
                                                <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
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
                                Showing <span className="font-medium">{orders.from}</span>–<span className="font-medium">{orders.to}</span> of <span className="font-medium">{orders.total}</span> orders
                            </p>
                            <div className="flex items-center gap-1">
                                {orders.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                            link.active ? 'bg-primary-600 text-white font-medium'
                                            : link.url ? 'text-gray-600 hover:bg-gray-100'
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
        </AdminLayout>
    );
}