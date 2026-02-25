import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PrimaryButton, StatusBadge, ConfirmModal, SelectInput } from '@/Components';

// ─── Type badge ───────────────────────────────────────────────────────────────

const TYPE_STYLES = {
    percentage:   'bg-violet-50 text-violet-600 ring-1 ring-violet-200',
    fixed:        'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
    free_shipping:'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
};

const TYPE_LABELS = {
    percentage:   'Percentage',
    fixed:        'Fixed',
    free_shipping:'Free Shipping',
};

function TypeBadge({ type }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[type] ?? 'bg-gray-100 text-gray-600'}`}>
            {TYPE_LABELS[type] ?? type}
        </span>
    );
}

function formatValue(coupon) {
    if (coupon.type === 'free_shipping') return 'Free';
    if (coupon.type === 'percentage')   return `${coupon.value}%`;
    return Number(coupon.value).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CouponsIndex({ coupons, filters }) {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const {flash} = usePage().props;

    const applyFilters = (key, value) => {
        router.get(route('admin.coupons.index'), 
        { ...filters, [key]: value || undefined }, 
        { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        applyFilters('search', e.target.value);
    };

    const handleDuplicate = (coupon) => {
        router.post(route('admin.coupons.duplicate', coupon.id), {}, { preserveScroll: true });
    };

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route('admin.coupons.destroy', deleteTarget.id), {
            preserveScroll: true,
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    return (
        <AdminLayout>
            <Head title="Coupons" />

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
                <Link href={route('admin.coupons.create')}>
                    <PrimaryButton>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Coupon
                    </PrimaryButton>
                </Link>
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



            {/* ── Card ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

                {/* Filters */}
                <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-gray-100">
                    <div className="relative flex-1 max-w-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by code..."
                            value={filters.search ?? ''}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    <SelectInput
                        value={filters.type ?? ''}
                        onChange={(e) => applyFilters('type', e.target.value)}
                        className="sm:w-44"
                        options={[
                            { value: '', label: 'All Types' },
                            { value: 'percentage', label: 'Percentage' },
                            { value: 'fixed', label: 'Fixed' },
                            { value: 'free_shipping', label: 'Free Shipping' },
                        ]}
                    />

                    <SelectInput
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters('status', e.target.value)}
                        className="sm:w-44"
                        options={[
                            { value: '', label: 'All Statuses' },
                            { value: 'active', label: 'Active' },
                            { value: 'expired', label: 'Expired' },
                            { value: 'inactive', label: 'Inactive' },
                        ]}
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {['Code', 'Type', 'Value', 'Usage', 'Valid Until', 'Status', 'Actions'].map((h, i) => (
                                    <th
                                        key={h}
                                        className={`px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}
                                    >  
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {coupons.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                            </svg>
                                            <p className="text-sm text-gray-400 font-medium">No coupons found</p>
                                            <p className="text-xs text-gray-300">Create your first coupon to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {coupons.data.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                                    {/* Code */}
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm font-bold text-gray-900 tracking-wider">
                                            {coupon.code}
                                        </span>
                                        {coupon.minimum_order_amount && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Min. {Number(coupon.minimum_order_amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })}
                                            </p>
                                        )}
                                    </td>

                                    {/* Type */}
                                    <td className="px-4 py-4">
                                        <TypeBadge type={coupon.type} />
                                    </td>

                                    {/* Value */}
                                    <td className="px-4 py-4">
                                        <span className="text-sm font-semibold text-gray-900">{formatValue(coupon)}</span>
                                    </td>

                                    {/* Usage */}
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-600 tabular-nums">
                                            {coupon.used_count} / {coupon.usage_limit ?? '∞'}
                                        </span>
                                        {coupon.usage_limit && (
                                            <div className="mt-1.5 w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        coupon.used_count >= coupon.usage_limit
                                                            ? 'bg-red-400'
                                                            : coupon.used_count / coupon.usage_limit > 0.75
                                                            ? 'bg-amber-400'
                                                            : 'bg-emerald-400'
                                                    }`}
                                                    style={{ width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </td>

                                    {/* Valid until */}
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-500">
                                            {coupon.valid_until_display ?? '—'}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <StatusBadge status={coupon.status} />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Edit */}
                                            <Link
                                                href={route('admin.coupons.edit', coupon.id)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                title="Edit coupon"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>

                                            {/* Duplicate */}
                                            <button
                                                onClick={() => handleDuplicate(coupon)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                title="Duplicate coupon"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={() => setDeleteTarget(coupon)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Delete coupon"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {coupons.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {coupons.from}–{coupons.to} of {coupons.total.toLocaleString()} coupons
                        </p>
                        <div className="flex items-center gap-1">
                            {coupons.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-primary-600 text-white font-medium'
                                            : link.url
                                            ? 'text-gray-600 hover:bg-gray-100'
                                            : 'text-gray-300 cursor-not-allowed pointer-events-none'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Coupon"
                message={`Are you sure you want to delete the coupon "${deleteTarget?.code}"? This action cannot be undone and all usage history will be lost.`}
                confirmText="Delete"
            />
        </AdminLayout>
    );
}