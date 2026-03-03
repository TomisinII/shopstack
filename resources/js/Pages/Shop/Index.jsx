import { useState, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ProductCard } from '@/Components';

// ─── Icons ────────────────────────────────────────────────────────────────────

const StarIcon = ({ filled, half }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20"
        fill={filled ? '#6d28d9' : half ? 'url(#half)' : 'none'}
        stroke={filled || half ? '#6d28d9' : '#d1d5db'} strokeWidth={1}>
        <defs>
            <linearGradient id="half"><stop offset="50%" stopColor="#6d28d9" /><stop offset="50%" stopColor="transparent" /></linearGradient>
        </defs>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function SidebarSection({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
            <button onClick={() => setOpen(v => !v)}
                className="flex items-center justify-between w-full mb-3 group">
                <span className="text-sm font-bold text-gray-900">{title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && children}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Index({ products, categories, brands, filters, priceStats, totalPublished }) {
    const [minPrice, setMinPrice] = useState(filters.min_price ?? priceStats.min);
    const [maxPrice, setMaxPrice] = useState(filters.max_price ?? priceStats.max);
    const [selectedBrands, setSelectedBrands] = useState(filters.brands ?? []);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const applyFilter = useCallback((key, value) => {
        router.get(route('shop.index'), {
            ...filters,
            [key]: value || undefined,
            page: undefined,
        }, { preserveState: true, replace: true });
    }, [filters]);

    const applyFilters = useCallback((overrides = {}) => {
        router.get(route('shop.index'), {
            ...filters,
            ...overrides,
            page: undefined,
        }, { preserveState: true, replace: true });
    }, [filters]);

    const toggleBrand = (id) => {
        const next = selectedBrands.includes(id)
            ? selectedBrands.filter(b => b !== id)
            : [...selectedBrands, id];
        setSelectedBrands(next);
        applyFilters({ brands: next.length ? next : undefined });
    };

    const clearFilters = () => {
        setMinPrice(priceStats.min);
        setMaxPrice(priceStats.max);
        setSelectedBrands([]);
        router.get(route('shop.index'), {}, { replace: true });
    };

    const hasActiveFilters = filters.category || filters.brands?.length ||
        filters.min_price || filters.max_price || filters.rating || filters.sale;

    const activeCategory = categories.find(c => String(c.id) === String(filters.category));

    // ── Sidebar content ───────────────────────────────────────────────────────
    const Sidebar = () => (
        <div className="space-y-0">
            {/* Categories */}
            <SidebarSection title="Categories">
                <ul className="space-y-1">
                    <li>
                        <button
                            onClick={() => applyFilters({ category: undefined })}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${!filters.category ? 'bg-primary-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <span>All Products</span>
                            <span className={`text-xs ${!filters.category ? 'text-primary-200' : 'text-gray-400'}`}>{totalPublished}</span>
                        </button>
                    </li>
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <button
                                onClick={() => applyFilter('category', cat.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${String(filters.category) === String(cat.id) ? 'bg-primary-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <span>{cat.name}</span>
                                <span className={`text-xs ${String(filters.category) === String(cat.id) ? 'text-primary-200' : 'text-gray-400'}`}>{cat.products_count}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </SidebarSection>

            {/* Price Range */}
            <SidebarSection title="Price Range">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <input type="text" value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ min_price: minPrice || undefined })}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-400 transition-colors"
                                placeholder="Min" />
                        </div>
                        <span className="text-gray-400 text-sm flex-shrink-0">—</span>
                        <div className="flex-1">
                            <input type="text" value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ max_price: maxPrice || undefined })}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-400 transition-colors"
                                placeholder="Max" />
                        </div>
                    </div>
                    <button
                        onClick={() => applyFilters({ min_price: minPrice || undefined, max_price: maxPrice || undefined })}
                        className="w-full py-2 text-xs font-semibold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors"
                    >
                        Apply
                    </button>
                </div>
            </SidebarSection>

            {/* Brands */}
            {brands.length > 0 && (
                <SidebarSection title="Brands">
                    <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {brands.map(brand => (
                            <li key={brand.id}>
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <input type="checkbox"
                                        checked={selectedBrands.includes(brand.id)}
                                        onChange={() => toggleBrand(brand.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex-1">{brand.name}</span>
                                    <span className="text-xs text-gray-400">{brand.products_count}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </SidebarSection>
            )}

            {/* Rating */}
            <SidebarSection title="Rating">
                <ul className="space-y-2">
                    {[4, 3, 2, 1].map(r => (
                        <li key={r}>
                            <button
                                onClick={() => applyFilter('rating', String(filters.rating) === String(r) ? undefined : r)}
                                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-xl transition-colors ${String(filters.rating) === String(r) ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <StarIcon key={s} filled={s <= r} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">& Up</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </SidebarSection>

            {/* On Sale toggle */}
            <SidebarSection title="Deals" defaultOpen={false}>
                <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox"
                        checked={!!filters.sale}
                        onChange={e => applyFilter('sale', e.target.checked ? true : undefined)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" />
                    <span className="text-sm text-gray-700">On Sale Only</span>
                </label>
            </SidebarSection>

            {/* Clear filters */}
            {hasActiveFilters && (
                <button onClick={clearFilters}
                    className="w-full py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors mt-2">
                    Clear All Filters
                </button>
            )}
        </div>
    );

    return (
        <AppLayout>
            <Head title={activeCategory ? `${activeCategory.name} — Shop` : 'Shop All Products'} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href={route('home')} className="hover:text-gray-900 transition-colors">Home</Link>
                    <span>/</span>
                    {activeCategory ? (
                        <>
                            <Link href={route('shop.index')} className="hover:text-gray-900 transition-colors">Shop</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">{activeCategory.name}</span>
                        </>
                    ) : (
                        <span className="text-gray-900 font-medium">Shop</span>
                    )}
                </nav>

                <div className="flex gap-8">
                    {/* ── Sidebar (desktop) ───────────────────────────────── */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                            <Sidebar />
                        </div>
                    </aside>

                    {/* ── Main content ────────────────────────────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {activeCategory ? activeCategory.name : 'All Products'}
                                </h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Showing {products.total} product{products.total !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Mobile filter toggle */}
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-600 inline-block" />}
                                </button>

                                {/* Sort dropdown */}
                                <select
                                    value={filters.sort}
                                    onChange={e => applyFilter('sort', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-400 bg-white text-gray-700 cursor-pointer transition-colors"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="newest">Newest First</option>
                                    <option value="top_rated">Top Rated</option>
                                    <option value="best_selling">Best Selling</option>
                                </select>
                            </div>
                        </div>

                        {/* Active filter pills */}
                        {hasActiveFilters && (
                            <div className="flex items-center gap-2 flex-wrap mb-5">
                                {activeCategory && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                                        {activeCategory.name}
                                        <button onClick={() => applyFilters({ category: undefined })} className="hover:text-primary-900">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </span>
                                )}
                                {filters.sale && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                                        On Sale
                                        <button onClick={() => applyFilter('sale', undefined)} className="hover:text-red-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Product grid */}
                        {products.data.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {products.data.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 mb-1">No products found</p>
                                <p className="text-sm text-gray-500 mb-5">Try adjusting your filters or search terms</p>
                                <button onClick={clearFilters}
                                    className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-semibold">{products.from}</span>–<span className="font-semibold">{products.to}</span> of <span className="font-semibold">{products.total}</span>
                                </p>
                                <div className="flex items-center gap-1">
                                    {products.links.map((link, i) => (
                                        <Link key={i} href={link.url ?? '#'} preserveState
                                            className={`px-3.5 py-2 text-sm rounded-xl transition-colors ${link.active ? 'bg-primary-600 text-white font-semibold' : link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed pointer-events-none'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            <>
                <div className={`fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setMobileFiltersOpen(false)} />
                <div className={`fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col ${mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                        <h2 className="text-base font-bold text-gray-900">Filters</h2>
                        <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        <Sidebar />
                    </div>
                </div>
            </>
        </AppLayout>
    );
}