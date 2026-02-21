import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    StatusBadge,
    StockBadge,
    StarRating,
    InfoRow,
    SectionCard,
    PrimaryButton,
    SecondaryButton,
    DangerButton,
    ConfirmModal,
} from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

export default function Show({ product }) {
    const [activeImage, setActiveImage] = useState(
        product.images?.find((img) => img.is_primary) ?? product.images?.[0] ?? null
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = () => {
        setDeleting(true);
        router.delete(route('admin.products.destroy', product.id), {
            onFinish: () => {
                setDeleting(false);
                setShowDeleteModal(false);
            },
        });
    };

    const discountPct = product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    return (
        <AdminLayout>
            <Head title={product.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Link href={route('admin.products.index')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                        <StatusBadge status={product.status} />
                        {product.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 ring-1 ring-primary-600/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Featured
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <SecondaryButton onClick={() => router.visit(route('admin.products.edit', product.id))}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Product
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

                    {/* ── Main column ─────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Images + core info */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                {/* Image gallery */}
                                <div className="space-y-3">
                                    <div className="aspect-square rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                                        {activeImage ? (
                                            <img src={activeImage.image_path} alt={activeImage.alt_text || product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {product.images?.length > 1 && (
                                        <div className="grid grid-cols-5 gap-2">
                                            {product.images.map((img) => (
                                                <button
                                                    key={img.id}
                                                    type="button"
                                                    onClick={() => setActiveImage(img)}
                                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                        activeImage?.id === img.id ? 'border-primary-500' : 'border-transparent hover:border-gray-300'
                                                    }`}
                                                >
                                                    <img src={img.image_path} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Core info */}
                                <div className="space-y-4">
                                    {/* Price */}
                                    <div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {formatCurrency(product.sale_price ?? product.price)}
                                            </span>
                                            {product.sale_price && (
                                                <>
                                                    <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                                                    <span className="text-sm font-semibold text-green-600">-{discountPct}%</span>
                                                </>
                                            )}
                                        </div>
                                        {product.cost_price && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Cost: {formatCurrency(product.cost_price)} ·{' '}
                                                <span className="text-green-600 font-medium">
                                                    Margin: {formatCurrency((product.sale_price ?? product.price) - product.cost_price)}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={Math.round(product.average_rating)} size="md" />
                                        <span className="text-sm text-gray-500">
                                            {product.average_rating.toFixed(1)} ({product.reviews?.length ?? 0} reviews)
                                        </span>
                                    </div>

                                    {/* Stock */}
                                    <div className="flex items-center gap-2">
                                        <StockBadge
                                            quantity={product.stock_quantity}
                                            status={product.stock_status}
                                            threshold={product.low_stock_threshold}
                                        />
                                        {product.low_stock_threshold && (
                                            <span className="text-xs text-gray-400">· Alert below {product.low_stock_threshold}</span>
                                        )}
                                    </div>

                                    {/* Detail rows */}
                                    <dl>
                                        <InfoRow label="SKU"      value={product.sku} />
                                        <InfoRow label="Category" value={product.category?.name} />
                                        <InfoRow label="Brand"    value={product.brand?.name} />
                                        <InfoRow label="Views"    value={product.views_count?.toLocaleString()} />
                                        <InfoRow label="Created"  value={product.created_at} />
                                        <InfoRow label="Updated"  value={product.updated_at} />
                                    </dl>

                                    {/* Tags */}
                                    {product.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {product.tags.map((tag) => (
                                                <span key={tag.id} className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <SectionCard title="Description">
                            {product.short_description && (
                                <p className="text-sm text-gray-500 italic pb-4 border-b border-gray-100">
                                    {product.short_description}
                                </p>
                            )}
                            <div
                                className="prose prose-sm max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </SectionCard>

                        {/* Reviews */}
                        <SectionCard
                            title="Customer Reviews"
                            description={`${product.reviews?.length ?? 0} total`}
                            action={
                                product.average_rating > 0 ? (
                                    <div className="flex items-center gap-1.5">
                                        <StarRating rating={Math.round(product.average_rating)} />
                                        <span className="text-sm font-semibold text-gray-700">{product.average_rating.toFixed(1)}</span>
                                    </div>
                                ) : null
                            }
                        >
                            {product.reviews?.length > 0 ? (
                                <div className="space-y-0 -mx-6 -mb-6">
                                    {product.reviews.map((review) => (
                                        <div key={review.id} className="px-6 py-5 border-t border-gray-50 first:border-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <StarRating rating={review.rating} />
                                                        <span className="text-sm font-semibold text-gray-800">{review.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs text-gray-500">{review.user.name}</span>
                                                        {review.is_verified_purchase && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                Verified
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-400">· {review.created_at}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{review.review}</p>
                                                </div>
                                                <StatusBadge status={review.is_approved ? 'published' : 'draft'} className="flex-shrink-0" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-sm text-gray-400">No reviews yet</p>
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* ── Sidebar ──────────────────────────────────── */}
                    <div className="space-y-6">

                        {/* Inventory */}
                        <SectionCard
                            title="Inventory"
                            action={
                                <Link href={route('admin.products.edit', product.id)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                    Update stock
                                </Link>
                            }
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Stock quantity</span>
                                <span className={`text-sm font-semibold ${
                                    product.stock_quantity <= 0 ? 'text-red-600'
                                    : product.stock_quantity <= product.low_stock_threshold ? 'text-amber-600'
                                    : 'text-green-600'
                                }`}>
                                    {product.stock_quantity} units
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${
                                        product.stock_quantity <= 0 ? 'bg-red-500'
                                        : product.stock_quantity <= product.low_stock_threshold ? 'bg-amber-500'
                                        : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min((product.stock_quantity / Math.max(product.stock_quantity, 100)) * 100, 100)}%` }}
                                />
                            </div>
                            <dl>
                                <InfoRow label="Low stock at"    value={`${product.low_stock_threshold} units`} />
                                <InfoRow label="Track inventory" value={product.track_inventory ? 'Yes' : 'No'} />
                                <InfoRow label="Backorders"      value={product.allow_backorders ? 'Allowed' : 'Not allowed'} />
                            </dl>
                        </SectionCard>

                        {/* Shipping */}
                        {(product.weight || product.length) && (
                            <SectionCard title="Shipping">
                                <dl>
                                    {product.weight && <InfoRow label="Weight" value={`${product.weight} kg`} />}
                                    {(product.length || product.width || product.height) && (
                                        <InfoRow
                                            label="Dimensions"
                                            value={`${product.length ?? '—'} × ${product.width ?? '—'} × ${product.height ?? '—'} cm`}
                                        />
                                    )}
                                </dl>
                            </SectionCard>
                        )}

                        {/* SEO preview */}
                        {(product.meta_title || product.meta_description) && (
                            <SectionCard title="SEO Preview">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-green-700 mb-0.5">shopstack.com/product/{product.slug}</p>
                                    <p className="text-sm font-medium text-blue-700">{product.meta_title || product.name}</p>
                                    {product.meta_description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.meta_description}</p>
                                    )}
                                </div>
                            </SectionCard>
                        )}

                        {/* Variants */}
                        {product.variants?.length > 0 && (
                            <SectionCard title="Variants" description={`${product.variants.length} variants`}>
                                <div className="-mx-6 -mb-6">
                                    {product.variants.map((variant) => (
                                        <div key={variant.id} className="px-6 py-3 flex items-center justify-between border-t border-gray-50 first:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{variant.name}</p>
                                                <p className="text-xs text-gray-400">{variant.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(variant.price ?? product.price)}</p>
                                                <p className={`text-xs font-medium ${variant.stock_quantity <= 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {variant.stock_quantity} left
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <PrimaryButton onClick={() => router.visit(route('admin.products.edit', product.id))} className="w-full justify-center">
                                Edit Product
                            </PrimaryButton>
                            <SecondaryButton onClick={() => router.visit(route('admin.products.index'))} className="w-full justify-center">
                                Back to Products
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Product"
                message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                confirmText="Delete Product"
            />
        </AdminLayout>
    );
}