import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { StarRating } from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const COLOR_MAP = {
    black: '#111', white: '#f5f5f5', gray: '#9ca3af', silver: '#cbd5e1',
    red: '#ef4444', blue: '#3b82f6', navy: '#1e3a5f', green: '#22c55e',
    purple: '#a855f7', pink: '#ec4899', yellow: '#eab308', orange: '#f97316',
    brown: '#92400e', beige: '#d4c5a9', gold: '#f59e0b',
};


export default function ProductCard({ product, showCartButton = false, className = '' }) {
    const { auth } = usePage().props;

    // Derive initial state from server-shared wishlist IDs so the heart
    // survives page reloads without an extra round trip.
    const initialWishlisted =
        product.is_wishlisted ??
        auth?.wishlist_ids?.includes(product.id) ??
        false;

    const [wishlisted, setWishlisted] = useState(initialWishlisted);
    const [addingToCart, setAddingToCart] = useState(false);

    const addToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAddingToCart(true);
        router.post(
            route('cart.add'),
            { product_id: product.id, quantity: 1 },
            {
                preserveScroll: true,
                onFinish: () => setAddingToCart(false),
            }
        );
    };

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlisted((v) => !v);
        router.post(
            route('wishlist.toggle'),
            { product_id: product.id },
            { preserveScroll: true }
        );
    };

    const outOfStock = product.stock_status === 'out_of_stock';
    const isCustomerOrGuest = !auth?.user || auth?.roles?.includes('Customer');

    return (
        <div className={`group flex flex-col ${className}`}>
            {/* Image */}
            <Link href={route('shop.show', product.slug)} className="block">
                <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-3">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                        {product.is_new && (
                            <span className="px-2.5 py-1 text-xs font-bold text-white bg-primary-600 rounded-full">NEW</span>
                        )}
                        {product.discount_percentage > 0 && (
                            <span className="px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                {product.discount_percentage}% OFF
                            </span>
                        )}
                        {outOfStock && (
                            <span className="px-2.5 py-1 text-xs font-bold text-white bg-gray-500 rounded-full">SOLD OUT</span>
                        )}
                    </div>

                    {/* Wishlist button — always visible when wishlisted, else appears on hover */}
                    <button
                        onClick={toggleWishlist}
                        className={`absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center transition-all hover:scale-110 ${
                            wishlisted && isCustomerOrGuest ? 'opacity-100' : isCustomerOrGuest ? 'opacity-0 group-hover:opacity-100' : 'hidden'
                        }`}
                        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    {/* Hover Add to Cart overlay — hidden when showCartButton is true */}
                    {!showCartButton && isCustomerOrGuest && (
                        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <button
                                onClick={addToCart}
                                disabled={outOfStock || addingToCart}
                                className="w-full py-2.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-semibold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="flex-1 flex flex-col space-y-1.5">
                {product.brand && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{product.brand}</p>
                )}

                <Link href={route('shop.show', product.slug)}>
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {product.name}
                    </p>
                </Link>

                {product.review_count > 0 && (
                    <div className="flex items-center gap-1.5">
                        <StarRating rating={product.average_rating} size="xs" />
                        <span className="text-xs text-gray-400">({product.review_count})</span>
                    </div>
                )}

                <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-primary-600">
                        {formatCurrency(product.sale_price ?? product.price)}
                    </span>
                    {product.sale_price && (
                        <span className="text-sm text-gray-400 line-through">{formatCurrency(product.price)}</span>
                    )}
                </div>

                {product.color_variants?.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                        {product.color_variants.slice(0, 5).map((color) => (
                            <div
                                key={color}
                                title={color}
                                className="w-4 h-4 rounded-full border border-gray-200 ring-1 ring-offset-1 ring-transparent hover:ring-primary-400 cursor-pointer transition-all"
                                style={{ backgroundColor: COLOR_MAP[color.toLowerCase()] ?? color }}
                            />
                        ))}
                        {product.color_variants.length > 5 && (
                            <span className="text-xs text-gray-400">+{product.color_variants.length - 5}</span>
                        )}
                    </div>
                )}

                {/* Always-visible Add to Cart button (wishlist page mode) */}
                {showCartButton && (
                    <div className="pt-2 mt-auto">
                        <button
                            onClick={addToCart}
                            disabled={outOfStock || addingToCart}
                            className="w-full py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {addingToCart ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}