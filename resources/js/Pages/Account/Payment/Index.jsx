import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { PrimaryButton, SecondaryButton, ConfirmModal } from '@/Components';

// Card brand SVG icons
const CardBrandIcon = ({ brand }) => {
    const b = brand?.toLowerCase();

    if (b === 'visa') return (
        <svg viewBox="0 0 48 48" className="w-8 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="6" fill="#1A1F71"/>
            <path d="M19.5 31H16L18.5 17H22L19.5 31Z" fill="white"/>
            <path d="M30.5 17.3C29.7 17 28.5 16.7 27 16.7C23.6 16.7 21.2 18.5 21.2 21C21.2 22.9 22.9 24 24.2 24.6C25.5 25.2 26 25.6 26 26.2C26 27 25 27.5 24.1 27.5C22.8 27.5 22.1 27.3 21 26.8L20.5 26.6L20 29.7C20.9 30.1 22.5 30.5 24.2 30.5C27.8 30.5 30.1 28.7 30.1 26C30.1 24.5 29.2 23.3 27.2 22.3C26 21.7 25.3 21.3 25.3 20.7C25.3 20.1 26 19.5 27.3 19.5C28.4 19.5 29.2 19.7 29.8 20L30.1 20.1L30.5 17.3Z" fill="white"/>
            <path d="M35 17H32.3C31.5 17 30.9 17.2 30.6 18.1L25.7 31H29.3L30 29H34.3L34.7 31H38L35 17ZM31 26.3L32.5 22.2L33.5 26.3H31Z" fill="white"/>
            <path d="M15.4 17L12 26.4L11.6 24.4C10.9 22.3 9 20 6.8 18.8L9.9 31H13.5L19.1 17H15.4Z" fill="white"/>
            <path d="M8.8 17H3.1L3 17.3C7.5 18.4 10.5 21 11.6 24.4L10.5 18.1C10.3 17.2 9.7 17 8.8 17Z" fill="#FAA61A"/>
        </svg>
    );

    if (b === 'mastercard') return (
        <svg viewBox="0 0 48 48" className="w-8 h-5" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="6" fill="#252525"/>
            <circle cx="18" cy="24" r="10" fill="#EB001B"/>
            <circle cx="30" cy="24" r="10" fill="#F79E1B"/>
            <path d="M24 16.3A10 10 0 0130 24a10 10 0 01-6 7.7A10 10 0 0118 24a10 10 0 016-7.7z" fill="#FF5F00"/>
        </svg>
    );

    if (b === 'amex') return (
        <svg viewBox="0 0 48 48" className="w-8 h-5" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="6" fill="#2E77BC"/>
            <text x="8" y="30" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">AMEX</text>
        </svg>
    );

    // Generic fallback
    return (
        <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        </div>
    );
};

// Stripe Card Element wrapper
function AddCardModal({ isOpen, onClose, stripeKey, setupIntentSecret, onSuccess }) {
    const cardRef = useRef(null);
    const elementRef = useRef(null);
    const stripeRef = useRef(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!isOpen || !stripeKey) return;

        // Load Stripe.js dynamically if not already loaded
        const load = async () => {
            if (!window.Stripe) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://js.stripe.com/v3/';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            stripeRef.current = window.Stripe(stripeKey);
            const elements = stripeRef.current.elements();

            elementRef.current = elements.create('card', {
                style: {
                    base: {
                        fontSize: '14px',
                        color: '#111827',
                        fontFamily: 'Figtree, sans-serif',
                        '::placeholder': { color: '#9ca3af' },
                    },
                    invalid: { color: '#ef4444' },
                },
            });

            // Wait a tick for the DOM node to render
            setTimeout(() => {
                if (cardRef.current) {
                    elementRef.current.mount(cardRef.current);
                    elementRef.current.on('ready', () => setReady(true));
                }
            }, 50);
        };

        load().catch(() => setError('Failed to load payment module. Please refresh.'));

        return () => {
            elementRef.current?.unmount();
            elementRef.current = null;
            setReady(false);
            setError('');
        };
    }, [isOpen, stripeKey]);

    const handleSubmit = async () => {
        if (!stripeRef.current || !elementRef.current) return;
        setError('');
        setLoading(true);

        const { setupIntent, error: stripeError } = await stripeRef.current.confirmCardSetup(
            setupIntentSecret,
            { payment_method: { card: elementRef.current } }
        );

        if (stripeError) {
            setError(stripeError.message);
            setLoading(false);
            return;
        }

        // Send the confirmed PM id to our backend
        router.post(route('account.payment.store'), {
            payment_method_id: setupIntent.payment_method,
        }, {
            onSuccess: () => {
                setLoading(false);
                onSuccess();
                onClose();
            },
            onError: () => {
                setError('Failed to save card. Please try again.');
                setLoading(false);
            },
        });
    };

    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };

    useEffect(() => {
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Add New Card</h3>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Card element */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card details</label>
                    <div
                        ref={cardRef}
                        className="w-full px-3.5 py-3 border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all min-h-[44px]"
                    />
                    {!ready && (
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Loading secure payment form...
                        </p>
                    )}
                    {error && (
                        <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </p>
                    )}
                </div>

                {/* Security note */}
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your card details are encrypted and handled securely by Stripe. We never store your card number.
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                    <SecondaryButton onClick={onClose} disabled={loading} className="flex-1 justify-center">
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton
                        onClick={handleSubmit}
                        loading={loading}
                        loadingText="Saving..."
                        disabled={!ready || loading}
                        className="flex-1 justify-center"
                    >
                        Save Card
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}

export default function Index({ payment_methods, setup_intent, stripe_key, billing_address }) {
    const [showAddModal, setShowAddModal]   = useState(false);
    const [deleteTarget, setDeleteTarget]   = useState(null);
    const [deletingId, setDeletingId]       = useState(null);
    const [settingDefault, setSettingDefault] = useState(null);

    const handleSetDefault = (pmId) => {
        setSettingDefault(pmId);
        router.patch(route('account.payment.default', pmId), {}, {
            onFinish: () => setSettingDefault(null),
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.id);
        router.delete(route('account.payment.destroy', deleteTarget.id), {
            onFinish: () => {
                setDeletingId(null);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <CustomerLayout>
            <Head title="Payment Methods" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage your saved cards for faster checkout</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Card
                    </button>
                </div>

                {/* Cards list */}
                {payment_methods.length > 0 ? (
                    <div className="space-y-3">
                        {payment_methods.map((pm) => (
                            <div
                                key={pm.id}
                                className={`bg-white rounded-xl border shadow-sm px-5 py-4 flex items-center gap-4 transition-all ${
                                    pm.is_default ? 'border-primary-200 ring-1 ring-primary-100' : 'border-gray-100'
                                }`}
                            >
                                {/* Brand icon */}
                                <div className="w-12 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100">
                                    <CardBrandIcon brand={pm.brand} />
                                </div>

                                {/* Card info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {pm.brand} •••• {pm.last4}
                                        </span>
                                        {pm.is_default && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 ring-1 ring-primary-200">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Expires {pm.exp_month}/{pm.exp_year}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {!pm.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(pm.id)}
                                            disabled={settingDefault === pm.id}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 transition-colors"
                                        >
                                            {settingDefault === pm.id ? (
                                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            ) : 'Set Default'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setDeleteTarget(pm)}
                                        disabled={deletingId === pm.id}
                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                        title="Remove card"
                                    >
                                        {deletingId === pm.id ? (
                                            <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">No saved cards yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add a card for faster, one-click checkout</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Your First Card
                        </button>
                    </div>
                )}

                {/* Billing Address */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Billing Address</h3>
                        <Link
                            href={route('account.addresses.index')}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                            {billing_address ? 'Edit Billing Address' : 'Add Billing Address'}
                        </Link>
                    </div>

                    <div className="p-6">
                        {billing_address ? (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">{billing_address.full_name}</p>
                                <p className="text-sm text-gray-600">{billing_address.address_line_1}</p>
                                {billing_address.address_line_2 && (
                                    <p className="text-sm text-gray-600">{billing_address.address_line_2}</p>
                                )}
                                <p className="text-sm text-gray-600">
                                    {[billing_address.city, billing_address.state, billing_address.zip_code].filter(Boolean).join(', ')}
                                </p>
                                <p className="text-sm text-gray-600">{billing_address.country}</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                No billing address saved.{' '}
                                <Link href={route('account.addresses.index')} className="text-primary-600 hover:text-primary-700 font-medium">
                                    Add one now
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-3 px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        All payment information is encrypted and processed securely by <span className="font-medium text-gray-700">Stripe</span>. ShopStack never stores your full card number or CVV.
                    </p>
                </div>
            </div>

            {/* Add Card Modal */}
            <AddCardModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                stripeKey={stripe_key}
                setupIntentSecret={setup_intent}
                onSuccess={() => {}}
            />

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={!!deletingId}
                title="Remove Card"
                message={
                    deleteTarget
                        ? `Remove ${deleteTarget.brand} •••• ${deleteTarget.last4} from your saved cards?`
                        : ''
                }
                confirmText="Remove Card"
            />
        </CustomerLayout>
    );
}