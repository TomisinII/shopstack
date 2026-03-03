import { Head, Link, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { StatusBadge } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function Dashboard({ stats, recent_orders, orders_breakdown }) {
    const {auth} = usePage().props;

    const statCards = [
        {
            title: 'Total Orders',
            value: stats.total_orders,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            bg: 'bg-primary-50',
            link: route('account.orders.index'),
            linkText: 'View all orders',
        },
        {
            title: 'Total Spent',
            value: formatCurrency(stats.total_spent),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bg: 'bg-green-50',
            link: null,
        },
        {
            title: 'Wishlist Items',
            value: stats.wishlist_count,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            bg: 'bg-rose-50',
            link: route('account.wishlist.index'),
            linkText: 'View wishlist',
        },
        {
            title: 'Loyalty Points',
            value: stats.loyalty_points.toLocaleString(),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ),
            bg: 'bg-amber-50',
            hint: '1 pt per ₦100 spent',
        },
    ];

    const hasOrders = recent_orders.length > 0;

    // Breakdown totals for the mini status summary
    const breakdownItems = STATUS_ORDER.filter((s) => orders_breakdown[s] > 0).map((s) => ({
        status: s,
        count: orders_breakdown[s],
    }));

    return (
        <CustomerLayout>
            <Head title="My Dashboard" />

            <div className="space-y-8">

                {/* Page heading */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {auth.user.name}!</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Here's a summary of your account activity</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card) => (
                        <div key={card.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
                            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 leading-tight">{card.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{card.title}</p>
                                {card.hint && <p className="text-xs text-gray-400 mt-1">{card.hint}</p>}
                                {card.link && (
                                    <Link href={card.link} className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                                        {card.linkText} →
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Recent Orders */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Your last {recent_orders.length} orders</p>
                            </div>
                            <Link href={route('account.orders.index')} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                View all →
                            </Link>
                        </div>

                        {hasOrders ? (
                            <div className="divide-y divide-gray-50">
                                {recent_orders.map((order) => (
                                    <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                        {/* Thumbnail */}
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                            {order.thumbnail ? (
                                                <img src={order.thumbnail} alt="Order" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                                                <StatusBadge status={order.status} />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {order.items_count} {order.items_count === 1 ? 'item' : 'items'} · {order.created_at}
                                            </p>
                                        </div>

                                        {/* Total + action */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</p>
                                            <Link
                                                href={route('account.orders.show', order.id)}
                                                className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-0.5 inline-block"
                                            >
                                                View →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p className="text-sm font-medium text-gray-500">No orders yet</p>
                                <p className="text-xs text-gray-400 mt-1">Your orders will appear here once you start shopping</p>
                                <Link href={route('shop.index')} className="inline-block mt-4 px-4 py-2 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                                    Browse Shop
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">

                        {/* Order Status Breakdown */}
                        {breakdownItems.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900">Orders by Status</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {breakdownItems.map(({ status, count }) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <StatusBadge status={status} />
                                            <span className="text-sm font-semibold text-gray-700">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Loyalty Points Card */}
                        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-5 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-semibold text-white/90">Loyalty Points</span>
                            </div>
                            <p className="text-3xl font-bold">{stats.loyalty_points.toLocaleString()}</p>
                            <p className="text-xs text-white/70 mt-1">Earn 1 point for every ₦100 spent</p>
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <p className="text-xs text-white/80">
                                    Total spent: <span className="font-semibold text-white">{formatCurrency(stats.total_spent)}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}