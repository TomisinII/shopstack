import { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const HeartIcon = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const CartIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const UserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ChevronDown = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const MenuIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// ─── Cart Drawer ─────────────────────────────────────────────────────────────

function CartDrawer({ open, onClose }) {
    const { cart } = usePage().props;
    const items = cart?.items ?? [];
    const subtotal = cart?.subtotal ?? 0;

    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

    const updateQty = (itemId, qty) => {
        router.patch(route('cart.update', itemId), { quantity: qty }, { preserveScroll: true });
    };

    const removeItem = (itemId) => {
        router.delete(route('cart.remove', itemId), { preserveScroll: true });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <CartIcon className="w-5 h-5 text-gray-700" />
                        <h2 className="text-base font-semibold text-gray-900">
                            Shopping Cart
                            <span className="ml-2 text-sm font-normal text-gray-400">({items.length})</span>
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        aria-label="Close cart"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-base font-semibold text-gray-900">Your cart is empty</p>
                                <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
                            </div>
                            <Link
                                href={route('shop.index')}
                                onClick={onClose}
                                className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-50 px-5 py-3">
                            {items.map((item) => (
                                <li key={item.id} className="py-4 flex items-start gap-3.5">
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{item.name}</p>
                                        {item.variant && (
                                            <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>
                                        )}
                                        <p className="text-sm font-bold text-primary-600 mt-1">{formatCurrency(item.price)}</p>

                                        {/* Qty controls + remove */}
                                        <div className="flex items-center justify-between mt-2.5">
                                            <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => updateQty(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 h-7 flex items-center justify-center text-xs font-semibold text-gray-800 border-x border-gray-200">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-sm font-medium"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                aria-label="Remove item"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer — only shown when cart has items */}
                {items.length > 0 && (
                    <div className="border-t border-gray-100 px-5 py-4 flex-shrink-0 space-y-3 bg-gray-50/50">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Subtotal</span>
                            <span className="text-base font-bold text-gray-900">{formatCurrency(subtotal)}</span>
                        </div>
                        <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout</p>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-1">
                            <Link
                                href={route('checkout.index')}
                                onClick={onClose}
                                className="w-full py-3 text-center text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
                            >
                                Checkout · {formatCurrency(subtotal)}
                            </Link>
                            <Link
                                href={route('cart.index')}
                                onClick={onClose}
                                className="w-full py-2.5 text-center text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                View full cart
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Search Overlay ───────────────────────────────────────────────────────────

function SearchOverlay({ onClose }) {
    const inputRef = useRef(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
        inputRef.current?.focus();
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.get(route('shop.index'), { search: query });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl px-5 py-4 border border-gray-100">
                    <SearchIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products, brands, categories..."
                        className="flex-1 text-base text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                    />
                    {query && (
                        <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    )}
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors">
                        Search
                    </button>
                </form>
                <p className="text-center text-xs text-gray-300 mt-3">Press <kbd className="px-1.5 py-0.5 bg-gray-700 text-gray-200 rounded text-xs font-mono">Esc</kbd> to close</p>
            </div>
        </div>
    );
}

// ─── User Dropdown ────────────────────────────────────────────────────────────

function UserDropdown({ auth }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const isCustomer = auth.roles?.includes('Customer');

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!auth?.user) {
        return (
            <div className="flex items-center gap-1">
                <Link
                    href={route('login')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                    Sign in
                </Link>
                <Link
                    href={route('register')}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
                >
                    Sign up
                </Link>
            </div>
        );
    }

    const user = auth.user;

    // Role-based dashboard link
    const dashboardRoute = auth.roles?.includes('Admin')
        ? route('admin.dashboard')
        : auth.roles?.includes('Vendor')
            ? route('vendor.dashboard')
            : route('account.dashboard');

    const initials = user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-colors group"
            >
            {user.avatar ? (
                <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-8 h-8 rounded-lg bg-primary-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {initials}
                </div>
            )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform hidden sm:block ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
                    <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                        <Link href={dashboardRoute} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>
                        {
                            isCustomer && (
                                <Link href={route('account.orders.index')} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setOpen(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    My Orders
                                </Link>
                            )
                        }
                    </div>
                    <div className="border-t border-gray-50 py-1">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

function MobileMenu({ open, onClose, onCartOpen, auth, cartCount, wishlistCount }) {

    const isCustomer = auth.roles?.includes('Customer');

    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const navLinks = [
        { label: 'Shop',       href: route('shop.index')     },
        { label: 'New Arrivals', href: route('shop.index') + '?sort=newest' },
        { label: 'Best Sellers', href: route('shop.index') + '?sort=best_selling' },
        { label: 'Sale',       href: route('shop.index') + '?sale=1' },
    ];

    const dashboardRoute = auth.roles?.includes('Admin')
        ? route('admin.dashboard')
        : auth.roles?.includes('Vendor')
            ? route('vendor.dashboard')
            : route('account.dashboard');

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            {/* Drawer */}
            <div className={`fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <Link href={route('home')} onClick={onClose}>
                        <span className="text-xl font-bold">
                            <span className="text-primary-600">Shop</span>
                            <span className="text-gray-900">Stack</span>
                        </span>
                    </Link>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Browse</p>
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={onClose}
                            className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="border-t border-gray-100 mt-4 pt-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">My Account</p>
                        {auth?.user ? (
                            <>
                                <Link href={dashboardRoute} onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                    Dashboard
                                </Link>
                                {
                                    isCustomer && (
                                        <>
                                            <Link href={route('account.orders.index')} onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                My Orders
                                            </Link>
                                            <Link href={route('wishlist.index')} onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            <HeartIcon className="w-4 h-4 text-gray-400" />
                                            Wishlist {wishlistCount > 0 && <span className="ml-auto text-xs font-semibold text-primary-600">{wishlistCount}</span>}
                                        </Link>
                                        </>
                                    )
                                }
                                <Link href={route('logout')} method="post" as="button" onClick={onClose} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign out
                                </Link>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 px-3 pt-1">
                                <Link href={route('login')} onClick={onClose} className="w-full py-2.5 text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    Sign in
                                </Link>
                                <Link href={route('register')} onClick={onClose} className="w-full py-2.5 text-center text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors">
                                    Create account
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                {
                    isCustomer && (
                        <>
                            {/* Cart CTA */}
                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={() => { onClose(); onCartOpen(); }}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    <CartIcon className="w-4 h-4" />
                                    View Cart {cartCount > 0 && `(${cartCount})`}
                                </button>
                            </div>
                        </>
                    )
                }
            </div>
        </>
    );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
    const { auth, cart, wishlist } = usePage().props;
    const [searchOpen, setSearchOpen]   = useState(false);
    const [mobileOpen, setMobileOpen]   = useState(false);
    const [cartOpen, setCartOpen]       = useState(false);
    const [scrolled, setScrolled]       = useState(false);
    const [shopOpen, setShopOpen]       = useState(false);
    const shopRef = useRef(null);

    const cartCount     = cart?.items_count ?? 0;
    const wishlistCount = wishlist?.count   ?? 0;

    const isCustomer = auth.roles?.includes('Customer');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => { if (shopRef.current && !shopRef.current.contains(e.target)) setShopOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close search on route change
    useEffect(() => { setSearchOpen(false); setMobileOpen(false); }, []);

    const shopCategories = [
        { label: 'New Arrivals',  href: route('shop.index') + '?sort=newest',       icon: '✦' },
        { label: 'Best Sellers',  href: route('shop.index') + '?sort=best_selling', icon: '★' },
        { label: 'Sale Items',    href: route('shop.index') + '?sale=1',            icon: '◈' },
        { label: 'All Products',  href: route('shop.index'),                         icon: '▦' },
    ];

    return (
        <>
            {/* Announcement bar */}
            <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-violet-600 text-white text-center py-2.5 px-4 text-xs font-medium tracking-wide">
                Free shipping on orders over ₦50,000 &nbsp;·&nbsp; Use code{' '}
                <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded-md ml-0.5">WELCOME10</span>
                {' '}for 10% off
            </div>

            {/* Main navbar */}
            <header className={`sticky top-0 z-30 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-sm border-b border-gray-100' : 'border-b border-gray-100'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">

                        {/* Left — mobile menu + logo */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Open menu"
                            >
                                <MenuIcon className="w-5 h-5" />
                            </button>

                            <Link href={route('home')} className="flex items-center gap-0 flex-shrink-0">
                                <span className="text-xl font-bold tracking-tight">
                                    <span className="text-primary-600">Shop</span>
                                    <span className="text-gray-900">Stack</span>
                                </span>
                            </Link>
                        </div>

                        {/* Center — primary navigation (desktop) */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {/* Shop mega-dropdown */}
                            <div ref={shopRef} className="relative">
                                <button
                                    onClick={() => setShopOpen((v) => !v)}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${shopOpen ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    Shop
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${shopOpen ? 'rotate-180 text-primary-600' : 'text-gray-400'}`} />
                                </button>

                                {shopOpen && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-2">
                                        {shopCategories.map((item) => (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                onClick={() => setShopOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                            >
                                                <span className="text-xs text-primary-400 font-mono w-4">{item.icon}</span>
                                                {item.label}
                                            </Link>
                                        ))}
                                        <div className="border-t border-gray-50 mt-1 pt-1">
                                            <Link
                                                href={route('shop.index')}
                                                onClick={() => setShopOpen(false)}
                                                className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                                            >
                                                Browse all categories
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link href={route('shop.index') + '?sort=newest'} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                                New Arrivals
                            </Link>
                            <Link href={route('shop.index') + '?sale=1'} className="px-4 py-2 text-sm font-medium rounded-xl transition-colors text-red-600 hover:bg-red-50">
                                Sale
                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-md">HOT</span>
                            </Link>
                        </nav>

                        {/* Right — actions */}
                        <div className="flex items-center gap-1">
                            {/* Search */}
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                                aria-label="Search"
                            >
                                <SearchIcon className="w-5 h-5" />
                            </button>


                            {
                                isCustomer && (
                                    <>
                                        {/* Wishlist */}
                                        <Link
                                            href={route('wishlist.index')}
                                            className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                                            aria-label="Wishlist"
                                        >
                                            <HeartIcon className="w-5 h-5" />
                                            {wishlistCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                                    {wishlistCount > 9 ? '9+' : wishlistCount}
                                                </span>
                                            )}
                                        </Link> 
                                    </>
                                )
                            }


                            {
                                isCustomer && (
                                    <>
                                        {/* Cart */}
                                        <button
                                            onClick={() => setCartOpen(true)}
                                            className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                                            aria-label="Cart"
                                        >
                                            <CartIcon className="w-5 h-5" />
                                            {cartCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                                    {cartCount > 9 ? '9+' : cartCount}
                                                </span>
                                            )}
                                        </button>
                                    </>
                                )
                            }

                            {/* Divider */}
                            <div className="hidden sm:block w-px h-5 bg-gray-200 mx-1" />

                            {/* User */}
                            <UserDropdown auth={auth} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Search overlay */}
            {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

            {
                isCustomer && (
                    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
                )
            }


            {/* Mobile drawer */}
            <MobileMenu
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                onCartOpen={() => setCartOpen(true)}
                auth={auth}
                cartCount={cartCount}
                wishlistCount={wishlistCount}
            />
        </>
    );
}