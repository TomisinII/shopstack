import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { SectionCard, SecondaryButton, DangerButton, ConfirmModal, StatusBadge } from '@/Components';

const Detail = ({ label, value }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
        <span className="text-sm text-gray-500 flex-shrink-0 w-36">{label}</span>
        <span className="text-sm font-medium text-gray-800 text-right">{value ?? '—'}</span>
    </div>
);

export default function Show({ category }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route('admin.categories.destroy', category.id), {
            onFinish: () => { setDeleting(false); setShowDeleteModal(false); },
        });
    };

    return (
        <AdminLayout>
            <Head title={category.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('admin.categories.index')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                                <StatusBadge status={category.is_active ? 'active' : 'draft'} />
                            </div>
                            {category.parent && (
                                <p className="text-sm text-gray-500 mt-0.5">under {category.parent.name}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <SecondaryButton onClick={() => router.visit(route('admin.categories.edit', category.id))}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </SecondaryButton>
                        <DangerButton onClick={() => setShowDeleteModal(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </DangerButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Main ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Image */}
                        {category.image && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <img src={`/storage/${category.image}`} alt={category.name} className="w-full h-52 object-cover" />
                            </div>
                        )}

                        {/* Details */}
                        <SectionCard title="Category Details">
                            <Detail label="Name" value={category.name} />
                            <Detail label="Slug" value={<span className="font-mono text-primary-600">{category.slug}</span>} />
                            <Detail label="Parent" value={category.parent?.name} />
                            <Detail label="Products" value={`${category.products_count} products`} />
                            <Detail label="Sort Order" value={category.sort_order} />
                            <Detail label="Status" value={<StatusBadge status={category.is_active ? 'active' : 'draft'} />} />
                            <Detail label="Created" value={category.created_at} />
                            <Detail label="Updated" value={category.updated_at} />
                            {category.description && (
                                <div className="pt-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Sub-categories */}
                        {category.children?.length > 0 && (
                            <SectionCard title="Sub-categories">
                                <div className="-mx-6 -mb-6">
                                    {category.children.map((child) => (
                                        <div key={child.id} className="flex items-center justify-between px-6 py-3.5 border-t border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-primary-50 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{child.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{child.slug}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-gray-400">{child.products_count} products</span>
                                                <Link href={route('admin.categories.edit', child.id)} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                                                    Edit →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-6">

                        {/* Stats */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Overview</p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Products',      value: category.products_count },
                                    { label: 'Sub-categories', value: category.children?.length ?? 0 },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SEO preview */}
                        {(category.meta_title || category.meta_description) && (
                            <SectionCard title="SEO Preview">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-green-700 truncate">shopstack.com/category/{category.slug}</p>
                                    <p className="text-sm font-medium text-blue-700 mt-0.5">{category.meta_title || category.name}</p>
                                    {category.meta_description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.meta_description}</p>
                                    )}
                                </div>
                            </SectionCard>
                        )}

                        {/* Quick actions */}
                        <div className="flex flex-col gap-3">
                            <SecondaryButton onClick={() => router.visit(route('admin.categories.edit', category.id))} className="w-full justify-center">
                                Edit Category
                            </SecondaryButton>
                            <SecondaryButton onClick={() => router.visit(route('admin.categories.create'))} className="w-full justify-center">
                                Add Sub-category
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Category"
                message={`Are you sure you want to delete "${category.name}"? Sub-categories will be moved to the top level. This cannot be undone.`}
                confirmText="Delete Category"
            />
        </AdminLayout>
    );
}