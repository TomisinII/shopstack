import { Head, Link } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import { StatusBadge, StatCard } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);


function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <span className="text-gray-400">{icon}</span>
                {label}
            </div>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">{value}</span>
        </div>
    );
}


export default function Dashboard({ storeName, stats, recentOrders, performance }) {
    return (
       <VendorLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {storeName} 👋
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Here's what's happening with your store today.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Products"
                        value={stats.total_products.toLocaleString()}
                        subtitle={stats.products_this_month > 0 ? `+${stats.products_this_month} this month` : 'No new products this month'}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>}
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats.total_orders.toLocaleString()}
                        subtitle={stats.orders_this_week > 0 ? `+${stats.orders_this_week} this week` : 'No new orders this week'}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>}
                    />
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.total_revenue)}
                        subtitle={
                            stats.revenue_growth !== null
                                ? `${stats.revenue_growth >= 0 ? '+' : ''}${stats.revenue_growth}%`
                                : 'No data last month'
                        }
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>}
                    />
                    <StatCard
                        title="Pending Payout"
                        value={formatCurrency(stats.pending_payout)}
                        subtitle={`Next: ${stats.next_payout_date}`}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>}
                    />
                </div>

                {/* Bottom section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Recent Orders */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
                            <Link
                                href={route('vendor.orders.index')}
                                className="text-xs font-medium text-primary-600 hover:text-primary-700"
                            >
                                View all →
                            </Link>
                        </div>

                        {recentOrders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        {/* Matches admin table: bg-gray-50/50, uppercase tracking-wider, font-semibold */}
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            {['Order', 'Customer', 'Product', 'Amount', 'Status'].map((h, i) => (
                                                <th
                                                    key={h}
                                                    className={`px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                                                        i === 4 ? 'text-right' : 'text-left'
                                                    }`}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">

                                                {/* Order */}
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('vendor.orders.show', order.id)}
                                                        className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-700">{order.customer}</span>
                                                </td>

                                                {/* Product */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-700 max-w-[160px] truncate block">
                                                        {order.product}
                                                    </span>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                                                        {formatCurrency(order.amount)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 text-right">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p className="text-sm text-gray-400">No orders yet</p>
                            </div>
                        )}
                    </div>

                    {/* Store Performance */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Store Performance</h2>
                        <div className="divide-y divide-gray-50">
                            <InfoRow
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>}
                                label="Store Rating"
                                value={performance.store_rating > 0 ? `${performance.store_rating.toFixed(1)} / 5.0` : '—'}
                            />
                            <InfoRow
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>}
                                label="Store Views (30d)"
                                value={performance.store_views.toLocaleString()}
                            />
                            <InfoRow
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>}
                                label="Conversion Rate"
                                value={`${performance.conversion_rate}%`}
                            />
                            <InfoRow
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>}
                                label="Avg. Order Value"
                                value={formatCurrency(performance.avg_order_value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
}