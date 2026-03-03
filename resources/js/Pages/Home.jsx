import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StarRating, ProductCard, CountdownTimer } from '@/Components';

// ─── Formatters ──────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, viewAllHref }) {
    return (
        <div className="flex items-end justify-between mb-8">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
                {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
            </div>
            {viewAllHref && (
                <Link
                    href={viewAllHref}
                    className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors flex-shrink-0"
                >
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            )}
        </div>
    );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function Home({ newArrivals, bestSellers, categories, deal, brands, testimonials }) {
    return (
        <AppLayout>
            <Head title="ShopStack — Shop the Latest Trends" />

            {/* ── 1. HERO ─────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center overflow-hidden bg-gray-900">
                {/* Background image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80"
                        alt="Hero"
                        className="w-full h-full object-cover opacity-50"
                    />
                    {/* Strong left gradient so text pops */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-gray-900/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
                    <div className="max-w-2xl">
                        {/* Label pill */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                            New Season Collection
                        </div>

                        {/* Headline */}
                        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
                            Shop the<br />
                            Latest{' '}
                            <span className="text-primary-400">Trends</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed max-w-lg">
                            Discover thousands of products from trusted vendors. Free shipping on orders over ₦50,000.
                        </p>

                        {/* CTAs */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <Link
                                href={route('shop.index')}
                                className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-500 transition-colors text-base shadow-lg shadow-primary-900/40"
                            >
                                Shop Now
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link
                                href={route('shop.index')}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-colors text-base border border-white/25"
                            >
                                Browse Categories
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. TRUST BAR ─────────────────────────────────────────────── */}
            <section className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        {[
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                ),
                                label: 'Free Shipping Over ₦50,000',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                ),
                                label: '30-Day Free Returns',
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                ),
                                label: 'Secure Checkout',
                            },
                        ].map(({ icon, label }) => (
                            <div key={label} className="flex items-center justify-center gap-3 py-4 px-6">
                                <span className="text-primary-600">{icon}</span>
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. SHOP BY CATEGORY ──────────────────────────────────────── */}
            {categories.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2>
                            <p className="text-gray-500 mt-2 text-sm">Find exactly what you're looking for</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={route('shop.index') + `?category=${cat.id}`}
                                    className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-gray-200 cursor-pointer"
                                >
                                    {cat.image ? (
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                                    )}
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                                    {/* Text */}
                                    <div className="absolute bottom-0 left-0 p-4">
                                        <p className="text-sm font-bold text-white leading-tight">{cat.name}</p>
                                        <p className="text-xs text-gray-300 mt-0.5">{cat.products_count} Products</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── 4. NEW ARRIVALS ──────────────────────────────────────────── */}
            {newArrivals.length > 0 && (
                <section className="py-16 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title="New Arrivals"
                            subtitle="Handpicked just for you"
                            viewAllHref={route('shop.index') + '?sort=newest'}
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* ── 5. DEAL OF THE DAY ───────────────────────────────────────── */}
            {deal && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-gray-950 border border-gray-800"
                            style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)' }}
                        >
                            {/* Gradient border effect */}
                            <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-r from-red-500 via-primary-500 to-blue-500 opacity-60 pointer-events-none" />

                            <div className="relative grid grid-cols-1 md:grid-cols-2">
                                {/* Image side */}
                                <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
                                    <span className="absolute top-5 left-5 z-10 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                        Flash Sale
                                    </span>
                                    {deal.image ? (
                                        <img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800" />
                                    )}
                                </div>

                                {/* Content side */}
                                <div className="p-8 sm:p-12 flex flex-col justify-center gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-2">
                                            Deal of the Day
                                        </p>
                                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                                            {deal.name}
                                        </h3>
                                        {deal.description && (
                                            <p className="text-gray-400 text-sm leading-relaxed">{deal.description}</p>
                                        )}
                                    </div>

                                    {/* Countdown */}
                                    {deal.sale_end && <CountdownTimer endTime={deal.sale_end} />}

                                    {/* Price */}
                                    <div className="flex items-baseline gap-3 flex-wrap">
                                        <span className="text-4xl font-extrabold text-white">
                                            {formatCurrency(deal.sale_price)}
                                        </span>
                                        <span className="text-xl text-gray-500 line-through">
                                            {formatCurrency(deal.price)}
                                        </span>
                                        <span className="text-sm font-bold text-green-400">
                                            Save {formatCurrency(deal.savings)}
                                        </span>
                                    </div>

                                    <Link
                                        href={route('shop.show', deal.slug)}
                                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 transition-colors text-sm w-fit"
                                    >
                                        Shop Now
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── 6. BEST SELLERS ──────────────────────────────────────────── */}
            {bestSellers.length > 0 && (
                <section className="py-16 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title="Best Sellers"
                            subtitle="Our most loved products"
                            viewAllHref={route('shop.index') + '?sort=best_selling'}
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* ── 7. BRAND LOGOS ───────────────────────────────────────────── */}
            {brands.length > 0 && (
                <section className="py-12 border-t border-b border-gray-100 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-16 flex-wrap">
                            {brands.map((brand) => (
                                <Link
                                    key={brand.id}
                                    href={route('shop.index') + `?brand=${brand.id}`}
                                    className="opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                                    title={brand.name}
                                >
                                    {brand.logo ? (
                                        <img src={brand.logo} alt={brand.name} className="h-7 object-contain" />
                                    ) : (
                                        <span className="text-lg font-bold text-gray-600 tracking-tight">{brand.name}</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── 8. TESTIMONIALS ──────────────────────────────────────────── */}
            {testimonials.length > 0 && (
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What Our Customers Say</h2>
                            <p className="text-gray-500 mt-2 text-sm">10,000+ happy customers and counting</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map((t) => (
                                <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
                                    {/* Quote mark */}
                                    <span className="absolute top-5 right-6 text-5xl font-serif text-gray-100 leading-none select-none">
                                        "
                                    </span>

                                    <StarRating rating={t.rating} size="sm" className="mb-3" />
                                    <p className="text-sm text-gray-700 leading-relaxed mb-5">"{t.review}"</p>

                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 flex items-center justify-center">
                                            {t.user.avatar ? (
                                                <img src={t.user.avatar} alt={t.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-primary-700">
                                                    {t.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{t.user.name}</p>
                                            {t.is_verified_purchase && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Verified Buyer
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── 9. NEWSLETTER CTA ────────────────────────────────────────── */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500 px-8 py-14 text-center">
                        {/* Decorative blobs */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                                Get 10% Off Your First Order
                            </h2>
                            <p className="text-primary-100 text-sm mb-8 max-w-md mx-auto">
                                Subscribe for exclusive deals, new arrivals, and style inspiration.
                            </p>
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="flex items-center gap-2 max-w-sm mx-auto"
                            >
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-5 py-3 text-sm bg-white/20 border border-white/30 text-white placeholder:text-primary-200 rounded-xl outline-none focus:bg-white/30 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-3 bg-white text-primary-700 text-sm font-bold rounded-xl hover:bg-primary-50 transition-colors flex-shrink-0 flex items-center gap-1.5"
                                >
                                    Subscribe
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </form>
                            <p className="text-primary-200 text-xs mt-3">No spam, unsubscribe anytime.</p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}