import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {StarRating} from '@/Components';

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

// ─── Product Card (Related) ───────────────────────────────────────────────────

function RelatedProductCard({ product }) {
    return (
        <Link href={route('shop.show', product.slug)} className="group block">
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-3">
                {product.image ? (
                    <img src={product.image} alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                {product.discount_percentage > 0 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                        {product.discount_percentage}% OFF
                    </span>
                )}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{product.brand}</p>
            <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-1.5">{product.name}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-primary-600">{formatCurrency(product.sale_price ?? product.price)}</span>
                {product.sale_price && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>}
            </div>
        </Link>
    );
}

// ─── Show Page ────────────────────────────────────────────────────────────────

export default function Show({ product, related }) {
    const [activeImage, setActiveImage]       = useState(0);
    const [selectedVariants, setSelectedVariants] = useState({});
    const [quantity, setQuantity]             = useState(1);
    const [activeTab, setActiveTab]           = useState('description');
    const [wishlisted, setWishlisted]         = useState(false);
    const [addingToCart, setAddingToCart]     = useState(false);

    const currentPrice = (() => {
        // If a variant is selected that has a custom price, use it
        const variantIds = Object.values(selectedVariants);
        if (variantIds.length > 0) {
            const matched = product.variants.find(v => variantIds.includes(v.id));
            if (matched?.price) return matched.price;
        }
        return product.sale_price ?? product.price;
    })();

    const addToCart = () => {
        setAddingToCart(true);
        router.post(route('cart.add'), {
            product_id: product.id,
            quantity,
            variant_id: Object.values(selectedVariants)[0] ?? null,
        }, {
            preserveScroll: true,
            onFinish: () => setAddingToCart(false),
        });
    };

    const toggleWishlist = () => {
        setWishlisted(v => !v);
        router.post(route('wishlist.toggle'), { product_id: product.id }, { preserveScroll: true });
    };

    const inStock = product.stock_status === 'in_stock' ||
        (product.stock_status === 'in_stock' && (!product.track_inventory || product.stock_quantity > 0));

    const tabs = [
        { id: 'description',    label: 'Description' },
        { id: 'specifications', label: 'Specifications' },
        { id: 'reviews',        label: `Reviews (${product.review_count})` },
    ];

    return (
        <AppLayout>
            <Head title={`${product.meta_title ?? product.name} — ShopStack`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href={route('home')} className="hover:text-gray-900 transition-colors">Home</Link>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <Link href={route('shop.index')} className="hover:text-gray-900 transition-colors">Shop</Link>
                    {product.category && (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            <Link href={`${route('shop.index')}?category=${product.category.id}`} className="hover:text-gray-900 transition-colors">
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
                </nav>

                {/* ── Product Main Section ─────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

                    {/* Left — Image gallery */}
                    <div className="space-y-4">
                        {/* Main image */}
                        <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square">
                            {product.images[activeImage] ? (
                                <img
                                    src={product.images[activeImage].url}
                                    alt={product.images[activeImage].alt}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}

                            {/* Badges on image */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {product.is_new && (
                                    <span className="px-3 py-1.5 text-xs font-bold text-white bg-primary-600 rounded-full">NEW</span>
                                )}
                                {product.discount_percentage > 0 && (
                                    <span className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                                        {product.discount_percentage}% OFF
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-1">
                                {product.images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(i)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === activeImage ? 'border-primary-600 ring-2 ring-primary-200' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right — Product info */}
                    <div className="space-y-6">
                        {/* Brand + SKU */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {product.brand && (
                                    <Link href={`${route('shop.index')}?brands[]=${product.brand.id}`}
                                        className="text-xs font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors">
                                        {product.brand.name}
                                    </Link>
                                )}
                                {product.brand && product.sku && <span className="text-gray-300">|</span>}
                                {product.sku && (
                                    <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                                )}
                            </div>
                        </div>

                        {/* Name */}
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

                        {/* Rating */}
                        {product.review_count > 0 && (
                            <div className="flex items-center gap-3">
                                <StarRating rating={product.average_rating} size="lg" />
                                <span className="text-sm font-semibold text-gray-700">{product.average_rating}</span>
                                <span className="text-sm text-gray-400">({product.review_count} reviews)</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="text-4xl font-extrabold text-primary-600">{formatCurrency(currentPrice)}</span>
                                {product.sale_price && (
                                    <span className="text-xl text-gray-400 line-through">{formatCurrency(product.price)}</span>
                                )}
                            </div>
                            {product.savings > 0 && (
                                <p className="text-sm font-medium text-green-600">
                                    You save {formatCurrency(product.savings)} ({product.discount_percentage}%)
                                </p>
                            )}
                        </div>

                        {/* Stock status */}
                        <div className="flex items-center gap-2">
                            {inStock ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium text-green-600">In Stock</span>
                                    {product.track_inventory && product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                                        <span className="text-xs text-amber-600 font-medium">
                                            — Only {product.stock_quantity} left
                                        </span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium text-red-600">Out of Stock</span>
                                </>
                            )}
                        </div>

                        {/* Short description */}
                        {product.short_description && (
                            <p className="text-gray-600 text-sm leading-relaxed">{product.short_description}</p>
                        )}

                        {/* Variant selectors */}
                        {Object.entries(product.variant_groups ?? {}).map(([type, values]) => (
                            <div key={type}>
                                <p className="text-sm font-semibold text-gray-900 mb-2.5 capitalize">
                                    {type}:{' '}
                                    <span className="font-normal text-gray-600">
                                        {selectedVariants[type]
                                            ? values.find(v => v.variant_id === selectedVariants[type])?.value
                                            : 'Select ' + type}
                                    </span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {values.map((v) => {
                                        const isSelected = selectedVariants[type] === v.variant_id;
                                        // Detect if value looks like a color
                                        const isColor = /^#|^rgb|^(black|white|red|blue|green|gray|silver|gold|brown|pink|purple|orange|navy|beige|yellow)$/i.test(v.value);

                                        if (isColor) {
                                            const COLOR_MAP = { black: '#111', white: '#f5f5f5', silver: '#cbd5e1', gray: '#9ca3af', red: '#ef4444', blue: '#3b82f6', green: '#22c55e', navy: '#1e3a5f', gold: '#f59e0b', brown: '#92400e' };
                                            return (
                                                <button key={v.variant_id}
                                                    onClick={() => setSelectedVariants(prev => ({ ...prev, [type]: v.variant_id }))}
                                                    title={v.value}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-primary-600 ring-2 ring-primary-200 scale-110' : 'border-gray-200 hover:scale-105'}`}
                                                    style={{ backgroundColor: COLOR_MAP[v.value.toLowerCase()] ?? v.value }}
                                                />
                                            );
                                        }

                                        return (
                                            <button key={v.variant_id}
                                                onClick={() => setSelectedVariants(prev => ({ ...prev, [type]: v.variant_id }))}
                                                className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all ${isSelected ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                                            >
                                                {v.value}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Quantity */}
                        <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2.5">Quantity</p>
                            <div className="flex items-center gap-0 border-2 border-gray-200 rounded-xl w-fit overflow-hidden">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-medium"
                                >
                                    −
                                </button>
                                <span className="w-12 h-11 flex items-center justify-center text-sm font-bold text-gray-900 border-x-2 border-gray-200">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* CTA Row */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={addToCart}
                                disabled={!inStock || addingToCart}
                                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-lg shadow-primary-900/20"
                            >
                                {addingToCart ? (
                                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                )}
                                {addingToCart ? 'Adding...' : 'Add to Cart'}
                            </button>

                            {/* Wishlist */}
                            <button onClick={toggleWishlist}
                                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${wishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}
                                aria-label="Add to wishlist">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>

                            {/* Share */}
                            <button
                                onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 text-gray-400 flex items-center justify-center hover:border-gray-300 hover:text-gray-600 transition-all"
                                aria-label="Share">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            {[
                                { icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0', label: 'Free Shipping' },
                                { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: '30-Day Returns' },
                                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: '2-Year Warranty' },
                            ].map(({ icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                    </svg>
                                    <span className="text-xs font-medium text-gray-600">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Tags */}
                        {product.tags?.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500 font-medium">Tags:</span>
                                {product.tags.map(tag => (
                                    <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Tabs Section ─────────────────────────────────────── */}
                <div className="mb-16">
                    {/* Tab nav */}
                    <div className="flex items-center gap-0 border-b border-gray-200 mb-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Description */}
                    {activeTab === 'description' && (
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                            {product.description
                                ? <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                : <p className="text-gray-400">No description available.</p>
                            }
                        </div>
                    )}

                    {/* Specifications — placeholder for future structured data */}
                    {activeTab === 'specifications' && (
                        <div className="max-w-2xl">
                            <p className="text-sm text-gray-400">Specifications will be listed here.</p>
                        </div>
                    )}

                    {/* Reviews */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-8">
                            {product.review_count > 0 ? (
                                <>
                                    {/* Summary */}
                                    <div className="flex items-start gap-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="text-center flex-shrink-0">
                                            <p className="text-6xl font-extrabold text-gray-900">{product.average_rating}</p>
                                            <StarRating rating={product.average_rating} size="lg" />
                                            <p className="text-sm text-gray-500 mt-1">{product.review_count} reviews</p>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const d = product.rating_distribution[star];
                                                return (
                                                    <div key={star} className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 w-16 flex-shrink-0">
                                                            <span className="text-xs text-gray-600">{star}</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                            <div className="h-2 bg-primary-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${d?.percent ?? 0}%` }} />
                                                        </div>
                                                        <span className="text-xs text-gray-500 w-8 text-right">{d?.count ?? 0}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Review list */}
                                    <div className="space-y-5">
                                        {product.reviews.map(review => (
                                            <div key={review.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            {review.user.avatar ? (
                                                                <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs font-bold text-primary-700">
                                                                    {review.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{review.user.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                <StarRating rating={review.rating} size="sm" />
                                                                {review.is_verified_purchase && (
                                                                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Verified
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400 flex-shrink-0">{review.created_at}</span>
                                                </div>
                                                {review.title && <p className="text-sm font-semibold text-gray-900 mb-1">{review.title}</p>}
                                                <p className="text-sm text-gray-600 leading-relaxed">{review.review}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 text-sm">No reviews yet. Be the first to review this product.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Related Products ─────────────────────────────────── */}
                {related.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">You May Also Like</h2>
                            <Link href={route('shop.index')} className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                            {related.map(p => <RelatedProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}