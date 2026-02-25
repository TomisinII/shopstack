import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    TextInput, SelectInput, Toggle, Checkbox,
    SectionCard, PrimaryButton, InputLabel,
} from '@/Components';

const TABS = [
    { key: 'general',  label: 'General'  },
    { key: 'payment',  label: 'Payment'  },
    { key: 'shipping', label: 'Shipping' },
    { key: 'tax',      label: 'Tax'      },
    { key: 'email',    label: 'Email'    },
    { key: 'advanced', label: 'Advanced' },
];

const CURRENCIES = [
    { value: 'NGN', label: 'NGN (₦)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'GHS', label: 'GHS (₵)' },
    { value: 'KES', label: 'KES (KSh)' },
    { value: 'ZAR', label: 'ZAR (R)'  },
];

const TIMEZONES = [
    { value: 'Africa/Lagos',      label: 'Africa/Lagos (WAT)'       },
    { value: 'Africa/Nairobi',    label: 'Africa/Nairobi (EAT)'     },
    { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
    { value: 'Africa/Accra',      label: 'Africa/Accra (GMT)'       },
    { value: 'UTC',               label: 'UTC'                      },
    { value: 'America/New_York',  label: 'UTC-5 (EST)'              },
    { value: 'America/Chicago',   label: 'UTC-6 (CST)'              },
    { value: 'America/Denver',    label: 'UTC-7 (MST)'              },
    { value: 'America/Los_Angeles', label: 'UTC-8 (PST)'            },
    { value: 'Europe/London',     label: 'UTC+0 (GMT)'              },
    { value: 'Europe/Paris',      label: 'UTC+1 (CET)'              },
    { value: 'Asia/Dubai',        label: 'UTC+4 (GST)'              },
];

export default function Index({ tab: initialTab, settings: initialSettings }) {
    const { flash } = usePage().props;
    const [tab, setTab] = useState(initialTab ?? 'general');
    const [data, setData] = useState(initialSettings);
    const [saving, setSaving] = useState(false);

    const set = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

    const save = () => {
        setSaving(true);
        router.post(route('admin.settings.update'), { ...data, tab }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const switchTab = (key) => {
        setTab(key);
        router.get(route('admin.settings.index'), { tab: key }, { preserveState: true, replace: true });
    };

    // ── Shipping zone helpers ─────────────────────────────────────────────
    const addZone = () =>
        set('shipping_zones', [...(data.shipping_zones ?? []), { name: '', rates: [] }]);

    const removeZone = (zi) =>
        set('shipping_zones', data.shipping_zones.filter((_, i) => i !== zi));

    const updateZone = (zi, field, value) =>
        set('shipping_zones', data.shipping_zones.map((z, i) => i === zi ? { ...z, [field]: value } : z));

    const addRate = (zi) =>
        updateZone(zi, 'rates', [...(data.shipping_zones[zi].rates ?? []), { label: '', price: 0, free_over: '' }]);

    const removeRate = (zi, ri) =>
        updateZone(zi, 'rates', data.shipping_zones[zi].rates.filter((_, i) => i !== ri));

    const updateRate = (zi, ri, field, value) =>
        updateZone(zi, 'rates', data.shipping_zones[zi].rates.map((r, i) => i === ri ? { ...r, [field]: value } : r));

    return (
        <AdminLayout>
            <Head title="Settings" />

            <div className="space-y-6">
                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.error}
                    </div>
                )}

                {/* Tab bar */}
                <div className="flex flex-wrap gap-2">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => switchTab(t.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                tab === t.key
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── General ─────────────────────────────────────────────── */}
                {tab === 'general' && (
                    <SectionCard title="Store Information">
                        <div>
                            <InputLabel htmlFor="store_name" required>Store Name</InputLabel>
                            <TextInput
                                id="store_name"
                                value={data.store_name}
                                onChange={(e) => set('store_name', e.target.value)}
                                placeholder="ShopStack"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="store_tagline">Store Tagline</InputLabel>
                            <TextInput
                                id="store_tagline"
                                value={data.store_tagline}
                                onChange={(e) => set('store_tagline', e.target.value)}
                                placeholder="Your trusted online marketplace"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="store_email" required>Store Email</InputLabel>
                            <TextInput
                                id="store_email"
                                type="email"
                                value={data.store_email}
                                onChange={(e) => set('store_email', e.target.value)}
                                placeholder="support@shopstack.com"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="store_phone">Store Phone</InputLabel>
                            <TextInput
                                id="store_phone"
                                value={data.store_phone}
                                onChange={(e) => set('store_phone', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="currency" required>Currency</InputLabel>
                                <SelectInput
                                    id="currency"
                                    value={data.currency}
                                    onChange={(e) => set('currency', e.target.value)}
                                    options={CURRENCIES}
                                    placeholder=""
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="timezone" required>Timezone</InputLabel>
                                <SelectInput
                                    id="timezone"
                                    value={data.timezone}
                                    onChange={(e) => set('timezone', e.target.value)}
                                    options={TIMEZONES}
                                    placeholder=""
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <PrimaryButton onClick={save} loading={saving} loadingText="Saving...">
                                Save Changes
                            </PrimaryButton>
                        </div>
                    </SectionCard>
                )}

                {/* ── Payment ─────────────────────────────────────────────── */}
                {tab === 'payment' && (
                    <div className="space-y-6">
                        <SectionCard title="Payment Methods">
                            {[
                                { key: 'payment_stripe_enabled',  label: 'Stripe',          desc: 'Credit/Debit cards'  },
                                { key: 'payment_paypal_enabled',  label: 'PayPal',           desc: 'PayPal checkout'     },
                                { key: 'payment_cod_enabled',     label: 'Cash on Delivery', desc: 'Pay on delivery'     },
                            ].map(({ key, label, desc }, i) => (
                                <div key={key} className={`flex items-center justify-between py-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                    </div>
                                    <Toggle
                                        id={key}
                                        checked={!!data[key]}
                                        onChange={(e) => set(key, e.target.checked)}
                                    />
                                </div>
                            ))}
                        </SectionCard>

                        {data.payment_stripe_enabled && (
                            <SectionCard title="Stripe Keys" description="Your Stripe API credentials">
                                <div>
                                    <InputLabel htmlFor="stripe_public_key">Publishable Key</InputLabel>
                                    <TextInput
                                        id="stripe_public_key"
                                        value={data.stripe_public_key}
                                        onChange={(e) => set('stripe_public_key', e.target.value)}
                                        placeholder="pk_live_..."
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="stripe_secret_key">Secret Key</InputLabel>
                                    <TextInput
                                        id="stripe_secret_key"
                                        type="password"
                                        value={data.stripe_secret_key}
                                        onChange={(e) => set('stripe_secret_key', e.target.value)}
                                        placeholder="sk_live_..."
                                    />
                                </div>
                            </SectionCard>
                        )}

                        {data.payment_paypal_enabled && (
                            <SectionCard title="Paystack Keys" description="Your Paystack API credentials">
                                <div>
                                    <InputLabel htmlFor="paystack_public_key">Public Key</InputLabel>
                                    <TextInput
                                        id="paystack_public_key"
                                        value={data.paystack_public_key}
                                        onChange={(e) => set('paystack_public_key', e.target.value)}
                                        placeholder="pk_live_..."
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="paystack_secret_key">Secret Key</InputLabel>
                                    <TextInput
                                        id="paystack_secret_key"
                                        type="password"
                                        value={data.paystack_secret_key}
                                        onChange={(e) => set('paystack_secret_key', e.target.value)}
                                        placeholder="sk_live_..."
                                    />
                                </div>
                            </SectionCard>
                        )}

                        <PrimaryButton onClick={save} loading={saving} loadingText="Saving...">
                            Save Changes
                        </PrimaryButton>
                    </div>
                )}

                {/* ── Shipping ─────────────────────────────────────────────── */}
                {tab === 'shipping' && (
                    <div className="space-y-6">
                        <SectionCard
                            title="Shipping Zones"
                            description="Define shipping regions and their rates"
                            action={
                                <button
                                    onClick={addZone}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Zone
                                </button>
                            }
                        >
                            {(data.shipping_zones ?? []).length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">No shipping zones yet. Add one to get started.</p>
                            ) : (
                                <div className="space-y-4">
                                    {(data.shipping_zones ?? []).map((zone, zi) => (
                                        <div key={zi} className="border border-gray-100 rounded-xl overflow-hidden">
                                            {/* Zone header */}
                                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                                                <input
                                                    type="text"
                                                    value={zone.name}
                                                    onChange={(e) => updateZone(zi, 'name', e.target.value)}
                                                    placeholder="Zone name (e.g. United States)"
                                                    className="flex-1 text-sm font-semibold text-gray-800 bg-transparent border-none outline-none placeholder:text-gray-400"
                                                />
                                                <button
                                                    onClick={() => removeZone(zi)}
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                    title="Remove zone"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Rates */}
                                            <div className="p-4 space-y-3">
                                                {(zone.rates ?? []).map((rate, ri) => (
                                                    <div key={ri} className="grid grid-cols-12 gap-2 items-center">
                                                        <div className="col-span-4">
                                                            <TextInput
                                                                value={rate.label}
                                                                onChange={(e) => updateRate(zi, ri, 'label', e.target.value)}
                                                                placeholder="Label (e.g. Standard)"
                                                            />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <TextInput
                                                                type="number"
                                                                value={rate.price}
                                                                onChange={(e) => updateRate(zi, ri, 'price', e.target.value)}
                                                                placeholder="Price"
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <TextInput
                                                                type="number"
                                                                value={rate.free_over ?? ''}
                                                                onChange={(e) => updateRate(zi, ri, 'free_over', e.target.value || null)}
                                                                placeholder="Free over (optional)"
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 flex justify-end">
                                                            <button
                                                                onClick={() => removeRate(zi, ri)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Column headers on first render */}
                                                {(zone.rates ?? []).length === 0 && (
                                                    <p className="text-xs text-gray-400">No rates yet.</p>
                                                )}

                                                <button
                                                    onClick={() => addRate(zi)}
                                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mt-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add rate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        <PrimaryButton onClick={save} loading={saving} loadingText="Saving...">
                            Save Changes
                        </PrimaryButton>
                    </div>
                )}

                {/* ── Tax ─────────────────────────────────────────────────── */}
                {tab === 'tax' && (
                    <div className="space-y-6">
                        <SectionCard title="Tax Settings">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Enable Taxes</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Collect tax on customer orders</p>
                                </div>
                                <Checkbox
                                    id="tax_enabled"
                                    checked={!!data.tax_enabled}
                                    onChange={(e) => set('tax_enabled', e.target.checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-50">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Prices Include Tax</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Product prices already include tax</p>
                                </div>
                                <Checkbox
                                    id="tax_prices_include"
                                    checked={!!data.tax_prices_include}
                                    onChange={(e) => set('tax_prices_include', e.target.checked)}
                                />
                            </div>
                            <div className="pt-2 border-t border-gray-50">
                                <InputLabel htmlFor="tax_based_on">Tax Calculation Based On</InputLabel>
                                <SelectInput
                                    id="tax_based_on"
                                    value={data.tax_based_on}
                                    onChange={(e) => set('tax_based_on', e.target.value)}
                                    options={[
                                        { value: 'shipping_address', label: 'Shipping Address' },
                                        { value: 'billing_address',  label: 'Billing Address'  },
                                        { value: 'store_address',    label: 'Store Address'    },
                                    ]}
                                    placeholder=""
                                />
                            </div>
                            {data.tax_enabled && (
                                <div>
                                    <InputLabel htmlFor="tax_rate">Default Tax Rate (%)</InputLabel>
                                    <TextInput
                                        id="tax_rate"
                                        type="number"
                                        value={data.tax_rate}
                                        onChange={(e) => set('tax_rate', e.target.value)}
                                        placeholder="7.5"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                </div>
                            )}
                        </SectionCard>

                        <PrimaryButton onClick={save} loading={saving} loadingText="Saving...">
                            Save Changes
                        </PrimaryButton>
                    </div>
                )}

                {/* ── Email ─────────────────────────────────────────────────── */}
                {tab === 'email' && (
                    <div className="space-y-6">
                        <SectionCard title="SMTP Configuration" description="Configure how outgoing emails are sent">
                            <div>
                                <InputLabel htmlFor="mail_driver">Mail Driver</InputLabel>
                                <SelectInput
                                    id="mail_driver"
                                    value={data.mail_driver}
                                    onChange={(e) => set('mail_driver', e.target.value)}
                                    options={[
                                        { value: 'smtp',     label: 'SMTP'     },
                                        { value: 'mailgun',  label: 'Mailgun'  },
                                        { value: 'ses',      label: 'Amazon SES' },
                                        { value: 'sendmail', label: 'Sendmail' },
                                        { value: 'log',      label: 'Log (testing)' },
                                    ]}
                                    placeholder=""
                                />
                            </div>
                            {data.mail_driver === 'smtp' && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="mail_host">SMTP Host</InputLabel>
                                            <TextInput
                                                id="mail_host"
                                                value={data.mail_host}
                                                onChange={(e) => set('mail_host', e.target.value)}
                                                placeholder="smtp.mailtrap.io"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="mail_port">SMTP Port</InputLabel>
                                            <TextInput
                                                id="mail_port"
                                                type="number"
                                                value={data.mail_port}
                                                onChange={(e) => set('mail_port', e.target.value)}
                                                placeholder="587"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="mail_username">Username</InputLabel>
                                            <TextInput
                                                id="mail_username"
                                                value={data.mail_username}
                                                onChange={(e) => set('mail_username', e.target.value)}
                                                placeholder="username"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="mail_password">Password</InputLabel>
                                            <TextInput
                                                id="mail_password"
                                                type="password"
                                                value={data.mail_password}
                                                onChange={(e) => set('mail_password', e.target.value)}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="mail_encryption">Encryption</InputLabel>
                                        <SelectInput
                                            id="mail_encryption"
                                            value={data.mail_encryption}
                                            onChange={(e) => set('mail_encryption', e.target.value)}
                                            options={[
                                                { value: 'tls', label: 'TLS' },
                                                { value: 'ssl', label: 'SSL' },
                                                { value: '',    label: 'None' },
                                            ]}
                                            placeholder=""
                                        />
                                    </div>
                                </>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <div>
                                    <InputLabel htmlFor="mail_from_address" required>From Address</InputLabel>
                                    <TextInput
                                        id="mail_from_address"
                                        type="email"
                                        value={data.mail_from_address}
                                        onChange={(e) => set('mail_from_address', e.target.value)}
                                        placeholder="noreply@shopstack.com"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="mail_from_name" required>From Name</InputLabel>
                                    <TextInput
                                        id="mail_from_name"
                                        value={data.mail_from_name}
                                        onChange={(e) => set('mail_from_name', e.target.value)}
                                        placeholder="ShopStack"
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Notification Triggers" description="Choose which events send automatic emails">
                            {[
                                { key: 'notify_new_order',     label: 'New Order',        desc: 'Alert admin when a new order is placed'     },
                                { key: 'notify_order_shipped', label: 'Order Shipped',     desc: 'Notify customer when their order ships'     },
                                { key: 'notify_low_stock',     label: 'Low Stock Alert',   desc: 'Alert admin when a product is running low'  },
                                { key: 'notify_new_customer',  label: 'New Registration',  desc: 'Notify admin when a new customer registers' },
                            ].map(({ key, label, desc }, i) => (
                                <div key={key} className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                    </div>
                                    <Toggle
                                        id={key}
                                        checked={!!data[key]}
                                        onChange={(e) => set(key, e.target.checked)}
                                    />
                                </div>
                            ))}
                        </SectionCard>

                        <PrimaryButton onClick={save} loading={saving} loadingText="Saving...">
                            Save Changes
                        </PrimaryButton>
                    </div>
                )}

                {/* ── Advanced ─────────────────────────────────────────────── */}
                {tab === 'advanced' && (
                    <div className="space-y-6">
                        <SectionCard title="Store Behaviour">
                            {[
                                { key: 'maintenance_mode',  label: 'Maintenance Mode',    desc: 'Take the storefront offline for customers'       },
                                { key: 'guest_checkout',    label: 'Guest Checkout',       desc: 'Allow customers to checkout without an account'  },
                                { key: 'user_registration', label: 'User Registration',    desc: 'Allow new customers to create accounts'          },
                            ].map(({ key, label, desc }, i) => (
                                <div key={key} className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                    </div>
                                    <Toggle
                                        id={key}
                                        checked={!!data[key]}
                                        onChange={(e) => set(key, e.target.checked)}
                                    />
                                </div>
                            ))}
                            <div className="pt-3 border-t border-gray-50">
                                <InputLabel htmlFor="items_per_page">Products Per Page</InputLabel>
                                <TextInput
                                    id="items_per_page"
                                    type="number"
                                    value={data.items_per_page}
                                    onChange={(e) => set('items_per_page', parseInt(e.target.value) || 15)}
                                    min="4"
                                    max="100"
                                    className="max-w-xs"
                                />
                            </div>
                        </SectionCard>

                        <SectionCard title="Analytics & Tracking" description="Connect third-party analytics tools">
                            <div>
                                <InputLabel htmlFor="google_analytics_id">Google Analytics ID</InputLabel>
                                <TextInput
                                    id="google_analytics_id"
                                    value={data.google_analytics_id}
                                    onChange={(e) => set('google_analytics_id', e.target.value)}
                                    placeholder="G-XXXXXXXXXX"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="facebook_pixel_id">Facebook Pixel ID</InputLabel>
                                <TextInput
                                    id="facebook_pixel_id"
                                    value={data.facebook_pixel_id}
                                    onChange={(e) => set('facebook_pixel_id', e.target.value)}
                                    placeholder="123456789012345"
                                />
                            </div>
                        </SectionCard>

                        <PrimaryButton onClick={save} loading={saving} loadingText="Saving...">
                            Save Changes
                        </PrimaryButton>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}