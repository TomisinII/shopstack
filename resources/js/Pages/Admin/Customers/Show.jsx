import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { StatusBadge, StarRating, SectionCard, InfoRow, StatCard, Avatar } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

export default function CustomerShow({ customer, stats, orders, addresses, reviews }) {

    return (
        <AdminLayout>
            <Head title={`Customer — ${customer.name}`} />

            {/* ── Breadcrumb ── */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Link href={route('admin.customers.index')} className="hover:text-primary-600 transition-colors">
                    Customers
                </Link>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700 font-medium">{customer.name}</span>
            </nav>

            {/* ── Profile card ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <Avatar name={customer.name} src={customer.avatar} />

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
                            <StatusBadge status={customer.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {customer.email}
                            </span>
                            {customer.phone && (
                                <span className="flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L8.5 10.5S10 13 13.5 15.5l1.113-1.724a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V6a2 2 0 012-2z" />
                                    </svg>
                                    {customer.phone}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Joined {customer.created_at}
                            </span>
                        </div>
                    </div>

                    <a
                        href={`mailto:${customer.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Email
                    </a>
                </div>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Orders"
                    value={stats.total_orders}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Total Spent"
                    value={formatCurrency(stats.total_spent)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Avg. Order Value"
                    value={formatCurrency(stats.avg_order)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Last Order"
                    value={stats.last_order_at ?? '—'}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                />
            </div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left col: Orders + Reviews */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Orders */}
                    <SectionCard
                        title="Order History"
                        description={`${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
                    >
                        {orders.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-gray-400">No orders yet</p>
                            </div>
                        ) : (
                            <div className="-mx-6 -mb-6 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Order</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Date</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Payment</th>
                                            <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <Link
                                                        href={route('admin.orders.show', order.id)}
                                                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                    <p className="text-xs text-gray-400">
                                                        {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-sm text-gray-500">{order.created_at}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={order.payment_status} />
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(order.total)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SectionCard>

                    {/* Reviews */}
                    <SectionCard
                        title="Reviews"
                        description={`${reviews.length} review${reviews.length !== 1 ? 's' : ''} submitted`}
                    >
                        {reviews.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-gray-400">No reviews yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{review.product_name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <StarRating rating={review.rating} size="sm" />
                                                    {review.title && (
                                                        <span className="text-xs text-gray-500 font-medium">{review.title}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <StatusBadge status={review.is_approved ? 'approved' : 'pending'} />
                                                <span className="text-xs text-gray-400">{review.created_at}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{review.review}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Right col: Details + Addresses */}
                <div className="space-y-6">
                    <SectionCard title="Customer Details">
                        <dl>
                            <InfoRow label="Name" value={customer.name} />
                            <InfoRow label="Email" value={customer.email} />
                            <InfoRow label="Phone" value={customer.phone} />
                            <InfoRow label="Status">
                                <StatusBadge status={customer.status} />
                            </InfoRow>
                            <InfoRow label="Joined" value={customer.created_at} />
                        </dl>
                    </SectionCard>

                    <SectionCard
                        title="Saved Addresses"
                        description={`${addresses.length} address${addresses.length !== 1 ? 'es' : ''}`}
                    >
                        {addresses.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No saved addresses</p>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        className={`p-4 rounded-lg border text-sm ${
                                            addr.default
                                                ? 'border-primary-200 bg-primary-50/40'
                                                : 'border-gray-100 bg-gray-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                {addr.type}
                                            </span>
                                            {addr.default && (
                                                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium text-gray-800">{addr.full_name}</p>
                                        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                                            {addr.city}, {addr.state}, {addr.country}
                                        </p>
                                        {addr.phone && (
                                            <p className="text-gray-400 text-xs mt-1">{addr.phone}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </AdminLayout>
    );
}