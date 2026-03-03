import { Head, router, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { DangerButton, SecondaryButton, ProductCard } from '@/Components';
import { useState } from 'react';

export default function Wishlist({ items }) {
    const { flash } = usePage().props;
    const [clearing, setClearing] = useState(false);

    const clearWishlist = () => {
        setClearing(true);
        router.delete(route('wishlist.clear'), {
            preserveScroll: true,
            onFinish: () => setClearing(false),
        });
    };

    return (
        <CustomerLayout>
            <Head title="My Wishlist" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                        {items.length > 0 && (
                            <span className="text-sm text-gray-400 font-medium">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="flex items-center gap-3">
                            <SecondaryButton
                                onClick={() => router.post(route('cart.add'), { wishlist_all: true }, { preserveScroll: true })}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Add All to Cart
                            </SecondaryButton>
                            <DangerButton
                                onClick={clearWishlist}
                                loading={clearing}
                                loadingText="Clearing..."
                            >
                                Clear Wishlist
                            </DangerButton>
                        </div>
                    )}
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {/* Grid */}
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map(({ wishlist_id, product }) => (
                            <div key={wishlist_id} className="relative group/card">
                                {/* Remove button */}
                                <button
                                    onClick={() => router.delete(route('wishlist.remove', wishlist_id), { preserveScroll: true })}
                                    className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm items-center justify-center hidden group-hover/card:flex transition-all hover:bg-red-50 hover:border-red-200"
                                    title="Remove from wishlist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <ProductCard
                                    product={product}
                                    showCartButton
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-sm text-gray-500 mb-6 max-w-xs">
                            Save items you love by clicking the heart icon on any product.
                        </p>
                        <a
                            href={route('shop.index')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                        >
                            Continue Shopping
                        </a>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}