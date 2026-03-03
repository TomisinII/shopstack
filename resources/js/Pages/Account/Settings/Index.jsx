import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import {
    InputLabel,
    TextInput,
    SectionCard,
    PrimaryButton,
    SelectInput,
    Checkbox
} from '@/Components';

const TABS = [
    { key: 'profile',       label: 'Profile'       },
    { key: 'security',      label: 'Security'      },
    { key: 'notifications', label: 'Notifications' },
    { key: 'preferences',   label: 'Preferences'   },
];

const NOTIFICATION_ITEMS = [
    { key: 'order_updates',           label: 'Order updates',           description: 'Status changes for your orders'          },
    { key: 'shipping_notifications',  label: 'Shipping notifications',  description: 'When your order ships or is delivered'   },
    { key: 'promotional_emails',      label: 'Promotional emails',      description: 'Sales, discounts and special offers'     },
    { key: 'product_recommendations', label: 'Product recommendations', description: 'Personalised picks based on your history'},
    { key: 'weekly_newsletter',       label: 'Weekly newsletter',       description: 'Curated products and store news'         },
];

// ─── Profile Tab ────────────────────────────────────────────────────────────
function ProfileTab({ profile }) {
    const { flash } = usePage().props;
    const avatarInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar ?? null);

    const nameParts = (profile.name ?? '').split(' ');
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ');

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        first_name: firstName,
        last_name: lastName,
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        avatar: null,
    });

    const initials = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || '?';

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('avatar', file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('account.profile.update'), { forceFormData: true });
    };

    return (
        <SectionCard title="Profile Information">
            <form onSubmit={submit} className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-lg font-bold text-primary-600">{initials}</span>
                        )}
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            Change Photo
                        </button>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP · Max 2MB</p>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="first_name" required>First Name</InputLabel>
                        <TextInput
                            id="first_name"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            placeholder="John"
                            error={errors.first_name}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="last_name" required>Last Name</InputLabel>
                        <TextInput
                            id="last_name"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            placeholder="Doe"
                            error={errors.last_name}
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" required>Email</InputLabel>
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="john@example.com"
                        error={errors.email}
                    />
                </div>

                {/* Phone */}
                <div>
                    <InputLabel htmlFor="phone">Phone</InputLabel>
                    <TextInput
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="+1 555-123-4567"
                        error={errors.phone}
                    />
                </div>

                {flash?.success && (
                    <p className="text-sm text-green-600 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </p>
                )}

                <PrimaryButton type="submit" loading={processing} loadingText="Saving...">
                    Save Changes
                </PrimaryButton>
            </form>
        </SectionCard>
    );
}

// ─── Security Tab ────────────────────────────────────────────────────────────
function SecurityTab() {
    const { flash } = usePage().props;
    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password: '',
        password:         '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('account.profile.password'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <SectionCard title="Change Password">
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="current_password" required>Current Password</InputLabel>
                    <TextInput
                        id="current_password"
                        type="password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        error={errors.current_password}
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" required>New Password</InputLabel>
                    <TextInput
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        error={errors.password}
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Min. 8 characters with mixed case and numbers</p>
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" required>Confirm Password</InputLabel>
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        error={errors.password_confirmation}
                    />
                </div>

                {flash?.success && (
                    <p className="text-sm text-green-600 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </p>
                )}

                <PrimaryButton type="submit" loading={processing} loadingText="Updating...">
                    Update Password
                </PrimaryButton>
            </form>
        </SectionCard>
    );
}

// ─── Notifications Tab ───────────────────────────────────────────────────────
function NotificationsTab({ notifications }) {
    const { flash } = usePage().props;
    const { data, setData, patch, processing } = useForm({ ...notifications });

    const submit = (e) => {
        e.preventDefault();
        patch(route('account.profile.notifications'));
    };

    return (
        <SectionCard title="Email Notifications">
            <form onSubmit={submit} className="space-y-1">
                {NOTIFICATION_ITEMS.map((item) => (
                    <label
                        key={item.key}
                        htmlFor={item.key}
                        className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 cursor-pointer group"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                                {item.label}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                        </div>

                        {/* Custom toggle-style checkbox matching the screenshot */}
                        <div className="relative flex-shrink-0 ml-4">
                            <Checkbox
                                id={item.key}
                                checked={!!data[item.key]}
                                onChange={(e) => setData(item.key, e.target.checked)}
                            />
                        </div>
                    </label>
                ))}

                {flash?.success && (
                    <p className="text-sm text-green-600 flex items-center gap-1.5 pt-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </p>
                )}

                <div className="pt-4">
                    <PrimaryButton type="submit" loading={processing} loadingText="Saving...">
                        Save Preferences
                    </PrimaryButton>
                </div>
            </form>
        </SectionCard>
    );
}

// ─── Preferences Tab ─────────────────────────────────────────────────────────
function PreferencesTab({ preferences }) {
    const { flash } = usePage().props;
    const { data, setData, patch, processing } = useForm({ ...preferences });

    const submit = (e) => {
        e.preventDefault();
        patch(route('account.profile.preferences'));
    };

    return (
        <SectionCard title="Display Preferences">
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="language">Language</InputLabel>
                    <SelectInput
                        id="language"
                        value={data.language}
                        onChange={(e) => setData('language', e.target.value)}
                        options={[
                            { value: 'en', label: 'English'  },
                            { value: 'fr', label: 'French'   },
                            { value: 'es', label: 'Spanish'  },
                            { value: 'de', label: 'German'   },
                            { value: 'ar', label: 'Arabic'   },
                        ]}
                        placeholder={null}
                    />
                </div>

                <div>
                    <InputLabel htmlFor="currency">Currency</InputLabel>
                    <SelectInput
                        id="currency"
                        value={data.currency}
                        onChange={(e) => setData('currency', e.target.value)}
                        options={[
                            { value: 'NGN', label: 'NGN (₦)' },
                            { value: 'USD', label: 'USD ($)' },
                            { value: 'EUR', label: 'EUR (€)' },
                            { value: 'GBP', label: 'GBP (£)' },
                        ]}
                        placeholder={null}
                    />
                </div>

                <div>
                    <InputLabel>Theme</InputLabel>
                    <div className="flex items-center gap-3 mt-1">
                        {['light', 'dark', 'auto'].map((t) => (
                            <label
                                key={t}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="theme"
                                    value={t}
                                    checked={data.theme === t}
                                    onChange={() => setData('theme', t)}
                                    className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700 capitalize">{t}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {flash?.success && (
                    <p className="text-sm text-green-600 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </p>
                )}

                <PrimaryButton type="submit" loading={processing} loadingText="Saving...">
                    Save Preferences
                </PrimaryButton>
            </form>
        </SectionCard>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Index({ profile, notifications, preferences }) {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <CustomerLayout>
            <Head title="Account Settings" />

            <div className="space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your profile, security and preferences</p>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-2 flex-wrap">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                                activeTab === tab.key
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div>
                    {activeTab === 'profile' && <ProfileTab profile={profile} />}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'notifications' && <NotificationsTab notifications={notifications} />}
                    {activeTab === 'preferences'   && <PreferencesTab   preferences={preferences} />}
                </div>
            </div>
        </CustomerLayout>
    );
}