import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ConfirmModal, StarRating } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);


function WishlistCard({ item, onRemove }) {
    const [movingToCart, setMovingToCart] = useState(false);
    const [removing, setRemoving]         = useState(false);

    const moveToCart = (e) => {
        e.preventDefault();
        setMovingToCart(true);
        router.post(route('wishlist.move-to-cart', item.wishlist_id), {}, {
            preserveScroll: true,
            onFinish: () => setMovingToCart(false),
        });
    };

    const remove = () => {
        setRemoving(true);
        onRemove(item.wishlist_id);
    };

    const inStock = item.stock_status === 'in_stock';

    return (
        <div className={`group bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-opacity ${removing ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Image */}
            <Link href={route('shop.show', item.slug)} className="block relative aspect-square overflow-hidden bg-gray-100">
                {item.image ? (
                    <img src={item.image} alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {item.is_new && (
                        <span className="px-2.5 py-1 text-xs font-bold text-white bg-primary-600 rounded-full">NEW</span>
                    )}
                    {item.discount_percentage > 0 && (
                        <span className="px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                            {item.discount_percentage}% OFF
                        </span>
                    )}
                    {!inStock && (
                        <span className="px-2.5 py-1 text-xs font-bold text-white bg-gray-500 rounded-full">
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Remove button */}
                <button
                    onClick={(e) => { e.preventDefault(); remove(); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-50"
                    aria-label="Remove from wishlist"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </Link>

            {/* Info */}
            <div className="p-4 space-y-2">
                {item.brand && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.brand}</p>
                )}
                <Link href={route('shop.show', item.slug)}
                    className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-primary-600 transition-colors block">
                    {item.name}
                </Link>

                {item.review_count > 0 && (
                    <div className="flex items-center gap-1.5">
                        <StarRating rating={item.average_rating} />
                        <span className="text-xs text-gray-400">({item.review_count})</span>
                    </div>
                )}

                <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-primary-600">
                        {formatCurrency(item.sale_price ?? item.price)}
                    </span>
                    {item.sale_price && (
                        <span className="text-sm text-gray-400 line-through">{formatCurrency(item.price)}</span>
                    )}
                </div>

                <p className="text-xs text-gray-400">Added {item.added_at}</p>

                {/* Move to cart */}
                <button
                    onClick={moveToCart}
                    disabled={!inStock || movingToCart}
                    className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white text-xs font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {movingToCart ? (
                        <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    )}
                    {movingToCart ? 'Moving...' : inStock ? 'Move to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
}

export default function Index({ items }) {
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearing, setClearing]             = useState(false);
    const [removingId, setRemovingId]         = useState(null);

    const handleRemove = (wishlistId) => {
        setRemovingId(wishlistId);
        router.delete(route('wishlist.remove', wishlistId), {
            preserveScroll: true,
            onFinish: () => setRemovingId(null),
        });
    };

    const clearAll = () => {
        setClearing(true);
        router.delete(route('wishlist.clear'), {
            preserveScroll: true,
            onFinish: () => {
                setClearing(false);
                setShowClearModal(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="My Wishlist — ShopStack" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                        {items.length > 0 && (
                            <p className="text-sm text-gray-500 mt-0.5">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
                        )}
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={() => setShowClearModal(true)}
                            className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                        >
                            Clear Wishlist
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    /* ── Empty state ─────────────────────────────────── */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-sm text-gray-500 mb-7 max-w-xs">
                            Save items you love and come back to them anytime.
                        </p>
                        <Link href={route('shop.index')}
                            className="px-7 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {items.map((item) => (
                                <WishlistCard
                                    key={item.wishlist_id}
                                    item={item}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100 flex-wrap gap-4">
                            <Link href={route('shop.index')}
                                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Continue Shopping
                            </Link>

                            {/* Move all in-stock to cart */}
                            {items.some(i => i.stock_status === 'in_stock') && (
                                <button
                                    onClick={() => router.post(route('cart.add-wishlist'), {}, { preserveScroll: true })}
                                    className="flex items-center gap-2 px-5 py-2.5 border-2 border-primary-600 text-primary-600 text-sm font-semibold rounded-xl hover:bg-primary-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Move All to Cart
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Clear Wishlist Confirm Modal */}
            <ConfirmModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={clearAll}
                title="Clear Wishlist"
                message="Are you sure you want to remove all saved items from your wishlist? This action cannot be undone."
                confirmText="Clear Wishlist"
                loading={clearing}
            />
        </AppLayout>
    );
}