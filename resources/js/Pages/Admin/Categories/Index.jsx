import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PrimaryButton, SelectInput, ConfirmModal, StatusBadge } from '@/Components';

const FolderIcon = () => (
    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
    </div>
);

export default function Index({ categories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilter = (key, value) =>
        router.get(route('admin.categories.index'), { ...filters, [key]: value || undefined, page: undefined }, { preserveState: true, replace: true });

    const handleSearch = (e) => { e.preventDefault(); applyFilter('search', search); };

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route('admin.categories.destroy', deleteTarget.id), {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    return (
        <AdminLayout>
            <Head title="Categories" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <PrimaryButton onClick={() => router.visit(route('admin.categories.create'))}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Category
                    </PrimaryButton>
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

                {/* Table card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Filters row */}
                    <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search categories..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </form>
                        <SelectInput
                            value={filters.status ?? ''}
                            onChange={(e) => applyFilter('status', e.target.value)}
                            options={[
                                { value: '',       label: 'All Statuses' },
                                { value: 'active', label: 'Active'       },
                                { value: 'draft',  label: 'Draft'        },
                            ]}
                            className="sm:w-40"
                        />
                    </div>

                    {/* Table */}
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {['Category', 'Slug', 'Products', 'Status', 'Actions'].map((h, i) => (
                                    <th
                                        key={h}
                                        className={`px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.data.length > 0 ? categories.data.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <FolderIcon />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                                                {cat.parent && <p className="text-xs text-gray-400 mt-0.5">under {cat.parent}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{cat.slug}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{cat.products_count}</td>
                                    <td className="px-6 py-4"><StatusBadge status={cat.is_active ? 'active' : 'draft'} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={route('admin.categories.show', cat.id)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors" title="View">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>
                                            <Link href={route('admin.categories.edit', cat.id)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                            <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors" title="Delete">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-gray-500">No categories found</p>
                                            <p className="text-xs text-gray-400">Try adjusting your search or add your first category</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {categories.last_page > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-medium">{categories.from}</span>–<span className="font-medium">{categories.to}</span> of <span className="font-medium">{categories.total}</span>
                            </p>
                            <div className="flex gap-1">
                                {categories.links.map((link, i) => (
                                    <Link key={i} href={link.url ?? '#'} preserveState
                                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${link.active ? 'bg-primary-600 text-white font-medium' : link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Category"
                message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? Sub-categories will be moved to the top level. This cannot be undone.` : ''}
                confirmText="Delete Category"
            />
        </AdminLayout>
    );
}