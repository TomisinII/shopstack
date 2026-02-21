import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { StatusBadge, StockBadge, SectionCard, InfoRow, StatCard, ConfirmModal } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

function StoreLogo({ storeName, src, size = 'lg' }) {
    const dim = size === 'lg' ? 'w-16 h-16 text-xl rounded-2xl' : 'w-10 h-10 text-xs rounded-xl';

    if (src) {
        return <img src={src} alt={storeName ?? 'Store'} className={`${dim} object-cover ring-4 ring-white shadow`} />;
    }

    const safeName = storeName || 'Unknown';
    const initials = safeName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
    const colors = [
        'bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700',
        'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
        'bg-rose-100 text-rose-700', 'bg-indigo-100 text-indigo-700',
    ];
    const color = colors[safeName.charCodeAt(0) % colors.length];

    return (
        <div className={`${dim} ${color} flex items-center justify-center font-bold ring-4 ring-white shadow`}>
            {initials}
        </div>
    );
}

const TRANSACTION_LABELS = {
    earning:    { label: 'Earning',    color: 'text-emerald-600' },
    payout:     { label: 'Payout',     color: 'text-blue-600'    },
    commission: { label: 'Commission', color: 'text-amber-600'   },
    refund:     { label: 'Refund',     color: 'text-red-600'     },
};

export default function VendorShow({ vendor, stats, products, transactions }) {
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspending, setSuspending] = useState(false);

    const handleApprove = () => {
        router.post(route('admin.vendors.approve', vendor.id), {}, { preserveScroll: true });
    };

    const confirmSuspend = () => {
        setSuspending(true);
        router.post(route('admin.vendors.suspend', vendor.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setSuspending(false);
                setShowSuspendModal(false);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title={`Vendor — ${vendor.store_name}`} />

            {/* ── Breadcrumb ── */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Link href={route('admin.vendors.index')} className="hover:text-primary-600 transition-colors">
                    Vendors
                </Link>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700 font-medium">{vendor.store_name ?? 'Unknown'}</span>
            </nav>

            {/* ── Store banner + profile header ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                {/* Banner */}
                {vendor.store_banner ? (
                    <div className="h-36 w-full overflow-hidden">
                        <img src={vendor.store_banner} alt="Store banner" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="h-36 bg-gradient-to-br from-primary-50 via-indigo-50 to-violet-50" />
                )}

                {/* Profile row */}
                <div className="px-6 py-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-8">
                        <div className="ring-4 ring-white rounded-2xl shadow flex-shrink-0">
                            <StoreLogo storeName={vendor.store_name} src={vendor.store_logo} size="lg" />
                        </div>

                        <div className="flex-1 min-w-0 pt-3 sm:pt-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h1 className="text-xl font-bold text-gray-900">{vendor.store_name ?? 'Unknown'}</h1>
                                <StatusBadge status={vendor.status} />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {vendor.name ?? 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {vendor.email}
                                </span>
                                {vendor.phone && (
                                    <span className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L8.5 10.5S10 13 13.5 15.5l1.113-1.724a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V6a2 2 0 012-2z" />
                                        </svg>
                                        {vendor.phone}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                                href={`mailto:${vendor.email}`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email
                            </a>

                            {vendor.status !== 'approved' ? (
                                <button
                                    onClick={handleApprove}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSuspendModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    Suspend
                                </button>
                            )}
                        </div>
                    </div>

                    {vendor.description && (
                        <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-2xl">{vendor.description}</p>
                    )}
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Products"
                    value={stats.total_products}
                    subtitle={`${stats.published} published`}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    }
                />
                <StatCard
                    title="Total Earned"
                    value={formatCurrency(stats.total_earned)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Commission"
                    value={formatCurrency(stats.total_commission)}
                    subtitle={`${stats.commission_rate}% rate`}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Pending Payout"
                    value={formatCurrency(stats.pending_payout)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
            </div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left: Products + Transactions */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Products table */}
                    <SectionCard
                        title="Products"
                    >
                        {products.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-gray-400">No products yet</p>
                            </div>
                        ) : (
                            <div className="-mx-6 -mb-6 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Product</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Category</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Price</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Stock</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                            {product.image ? (
                                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-sm text-gray-500">{product.category ?? '—'}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StockBadge quantity={product.stock} status={product.stock_status} />
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={product.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SectionCard>

                    {/* Transactions */}
                    <SectionCard
                        title="Recent Transactions"
                        description="Last 20 transactions"
                    >
                        {transactions.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-gray-400">No transactions yet</p>
                            </div>
                        ) : (
                            <div className="-mx-6 -mb-6 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Type</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Description</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Date</th>
                                            <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                                            <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {transactions.map((t) => {
                                            const meta = TRANSACTION_LABELS[t.type] ?? { label: t.type, color: 'text-gray-600' };
                                            return (
                                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-3.5">
                                                        <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-sm text-gray-500 truncate max-w-[160px] block">{t.description ?? '—'}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-sm text-gray-500">{t.created_at}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <StatusBadge status={t.status} />
                                                    </td>
                                                    <td className="px-6 py-3.5 text-right">
                                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(t.net_amount)}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Right: Store details */}
                <div className="space-y-6">
                    <SectionCard title="Store Details">
                        <dl>
                            <InfoRow label="Store Name" value={vendor.store_name} />
                            <InfoRow label="Store Slug" value={vendor.store_slug} />
                            <InfoRow label="Owner" value={vendor.name} />
                            <InfoRow label="Email" value={vendor.email} />
                            <InfoRow label="Phone" value={vendor.phone} />
                            <InfoRow label="Address" value={vendor.address} />
                            <InfoRow label="Commission">
                                <span className="text-sm font-semibold text-amber-600">{stats.commission_rate}%</span>
                            </InfoRow>
                            <InfoRow label="Status">
                                <StatusBadge status={vendor.status} />
                            </InfoRow>
                            <InfoRow label="Joined" value={vendor.created_at} />
                        </dl>
                    </SectionCard>

                    {/* Earnings breakdown */}
                    <SectionCard title="Earnings Breakdown">
                        <div className="space-y-3">
                            {[
                                { label: 'Total Earned',   value: stats.total_earned,     color: 'text-emerald-600' },
                                { label: 'Commission Paid',value: stats.total_commission,  color: 'text-amber-600'  },
                                { label: 'Paid Out',       value: stats.total_paid_out,    color: 'text-blue-600'   },
                                { label: 'Pending Payout', value: stats.pending_payout,    color: 'text-indigo-600' },
                            ].map((row) => (
                                <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{row.label}</span>
                                    <span className={`text-sm font-semibold ${row.color}`}>{formatCurrency(row.value)}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>

            <ConfirmModal
                isOpen={showSuspendModal}
                onClose={() => setShowSuspendModal(false)}
                onConfirm={confirmSuspend}
                loading={suspending}
                title="Suspend Vendor"
                message={`Are you sure you want to suspend ${vendor.store_name}? They will immediately lose access to their vendor dashboard.`}
                confirmText="Suspend"
            />
        </AdminLayout>
    );
}