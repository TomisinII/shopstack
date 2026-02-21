import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { StatusBadge, ConfirmModal, SelectInput } from '@/Components';

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

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

export default function VendorsIndex({ vendors, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [suspendTarget, setSuspendTarget] = useState(null);
    const [suspending, setSuspending] = useState(false);

    const applyFilters = (key, value) => {
        router.get(
            route('admin.vendors.index'),
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters('search', search);
    };

    const handleApprove = (vendor) => {
        router.post(route('admin.vendors.approve', vendor.id), {}, { preserveScroll: true });
    };

    const confirmSuspend = () => {
        setSuspending(true);
        router.post(route('admin.vendors.suspend', suspendTarget.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setSuspending(false);
                setSuspendTarget(null);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Vendors" />

            {/* ── Page header ── */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
            </div>

            {/* ── Card ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

                {/* Filters */}
                <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-gray-100">
                    <div className="relative flex-1 max-w-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    <SelectInput
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters('status', e.target.value)}
                        options={[
                            { value: '', label: 'All Statuses' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'suspended', label: 'Suspended' },
                        ]}
                        className='sm:w-44'
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {['Vendor', 'Products', 'Sales', 'Commission', 'Payout', 'Status', 'Actions'].map((h, i) => (
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
                            {vendors.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <p className="text-sm text-gray-400 font-medium">No vendors found</p>
                                            <p className="text-xs text-gray-300">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {vendors.data.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors group">
                                    {/* Vendor */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <StoreLogo storeName={vendor.store_name} src={vendor.store_logo} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                                    {vendor.store_name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">{vendor.name}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Products */}
                                    <td className="px-4 py-4">
                                        <span className="text-sm font-medium text-gray-900">{vendor.products_count}</span>
                                    </td>

                                    {/* Sales */}
                                    <td className="px-4 py-4">
                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(vendor.total_sales)}</span>
                                    </td>

                                    {/* Commission */}
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-600">{formatCurrency(vendor.commission)}</span>
                                    </td>

                                    {/* Payout */}
                                    <td className="px-4 py-4">
                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(vendor.payout)}</span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <StatusBadge status={vendor.status} />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* View */}
                                            <Link
                                                href={route('admin.vendors.show', vendor.id)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                title="View vendor"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>

                                            {/* Approve (pending/suspended only) */}
                                            {vendor.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleApprove(vendor)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                    title="Approve vendor"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            )}

                                            {/* Suspend (approved only) */}
                                            {vendor.status === 'approved' && (
                                                <button
                                                    onClick={() => setSuspendTarget(vendor)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Suspend vendor"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {vendors.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {vendors.from}–{vendors.to} of {vendors.total.toLocaleString()} vendors
                        </p>
                        <div className="flex items-center gap-1">
                            {vendors.links.map((link, i) => (
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
                isOpen={suspendTarget !== null}
                onClose={() => setSuspendTarget(null)}
                onConfirm={confirmSuspend}
                loading={suspending}
                title="Suspend Vendor"
                message={`Are you sure you want to suspend ${suspendTarget?.store_name}? They will immediately lose access to their vendor dashboard.`}
                confirmText="Suspend"
            />
        </AdminLayout>
    );
}