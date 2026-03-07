import { useRef, useState } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import {
    SectionCard,
    InputLabel,
    TextInput,
    TextArea,
    PrimaryButton,
} from '@/Components';

export default function Index({ profile, user }) {
    const { flash } = usePage().props;

    const logoInputRef   = useRef(null);
    const bannerInputRef = useRef(null);
    const [logoPreview,   setLogoPreview]   = useState(profile?.store_logo   ?? null);
    const [bannerPreview, setBannerPreview] = useState(profile?.store_banner ?? null);

    const { data, setData, post, processing, errors } = useForm({
        _method:            'POST',
        store_name:         profile?.store_name        ?? '',
        store_slug:         profile?.store_slug        ?? '',
        store_description:  profile?.store_description ?? '',
        phone:              profile?.phone             ?? '',
        address:            profile?.address           ?? '',
        store_logo:         null,
        store_banner:       null,
        // Payout — displayed masked, only submitted if changed
        bank_name:          '',
        account_number:     '',
        routing_number:     '',
    });

    const handleImageChange = (field, setPreview) => (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData(field, file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('vendor.settings.update'), { forceFormData: true });
    };

    return (
        <VendorLayout>
            <Head title="Store Settings" />

            <form onSubmit={submit}>
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage your store profile and payout details</p>
                        </div>
                        <PrimaryButton type="submit" loading={processing} loadingText="Saving...">
                            Save Changes
                        </PrimaryButton>
                    </div>

                    {/* Flash */}
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
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {flash.error}
                        </div>
                    )}

                    {/* Approval banner */}
                    {profile?.status === 'pending' && (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            Your store is pending admin approval. You can update your settings in the meantime.
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Main column ─────────────────────────────── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Store Information */}
                            <SectionCard title="Store Information" description="This information is displayed publicly on your store page">
                                <div>
                                    <InputLabel htmlFor="store_name" required>Store Name</InputLabel>
                                    <TextInput
                                        id="store_name"
                                        type="text"
                                        value={data.store_name}
                                        onChange={(e) => setData('store_name', e.target.value)}
                                        placeholder="e.g. TechHub Pro"
                                        error={errors.store_name}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="store_slug">Store URL Slug</InputLabel>
                                    <div className="flex items-center gap-0">
                                        <span className="px-3.5 py-2.5 text-sm bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-gray-400 select-none whitespace-nowrap">
                                            shopstack.com/store/
                                        </span>
                                        <TextInput
                                            id="store_slug"
                                            type="text"
                                            value={data.store_slug}
                                            onChange={(e) => setData('store_slug', e.target.value)}
                                            placeholder="your-store"
                                            error={errors.store_slug}
                                            className="rounded-l-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="store_description">Description</InputLabel>
                                    <TextArea
                                        id="store_description"
                                        rows={4}
                                        value={data.store_description}
                                        onChange={(e) => setData('store_description', e.target.value)}
                                        placeholder="Tell customers what your store is about..."
                                        maxLength={1000}
                                        error={errors.store_description}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="phone">Phone</InputLabel>
                                        <TextInput
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+1 555-000-0000"
                                            error={errors.phone}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="address">Address</InputLabel>
                                        <TextInput
                                            id="address"
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="14, Admiralty Way, Ikoyi"
                                            error={errors.address}
                                        />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Payout Settings */}
                            <SectionCard
                                title="Payout Settings"
                                description="Bank details used to process your earnings payouts"
                            >
                                <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-6v2m0 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs text-amber-700">
                                        Your banking details are encrypted and stored securely. Only enter new values to update them — leave blank to keep existing details.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="bank_name">Bank Name</InputLabel>
                                    <TextInput
                                        id="bank_name"
                                        type="text"
                                        value={data.bank_name ?? ''}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                        placeholder="e.g. Chase Bank"
                                        error={errors.bank_name}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="account_number">Account Number</InputLabel>
                                        <TextInput
                                            id="account_number"
                                            type="password"
                                            value={data.account_number ?? ''}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            placeholder="Enter to update"
                                            error={errors.account_number}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="routing_number">Routing Number</InputLabel>
                                        <TextInput
                                            id="routing_number"
                                            type="password"
                                            value={data.routing_number ?? ''}
                                            onChange={(e) => setData('routing_number', e.target.value)}
                                            placeholder="Enter to update"
                                            autoComplete="new-password"
                                            error={errors.routing_number}
                                        />
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {/* ── Sidebar ──────────────────────────────────── */}
                        <div className="space-y-6">

                            {/* Store Logo */}
                            <SectionCard title="Store Logo" description="Square image, recommended 400×400px">
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange('store_logo', setLogoPreview)}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-primary-400 transition-colors group bg-gray-50 flex items-center justify-center"
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                                    >
                                        {logoPreview ? 'Change logo' : 'Upload logo'}
                                    </button>
                                    {errors.store_logo && (
                                        <p className="text-xs text-red-500">{errors.store_logo}</p>
                                    )}
                                </div>
                            </SectionCard>

                            {/* Store Banner */}
                            <SectionCard title="Store Banner" description="Wide image, recommended 1200×300px">
                                <input
                                    ref={bannerInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange('store_banner', setBannerPreview)}
                                />
                                <div
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="w-full aspect-[4/1] rounded-xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-primary-400 transition-colors group bg-gray-50 flex items-center justify-center"
                                >
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Store banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-300 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-xs text-gray-400 group-hover:text-primary-500 transition-colors">Upload banner</span>
                                        </div>
                                    )}
                                </div>
                                {errors.store_banner && (
                                    <p className="text-xs text-red-500 mt-1">{errors.store_banner}</p>
                                )}
                            </SectionCard>

                            {/* Account info (read-only) */}
                            <SectionCard title="Account" description="Managed via account settings">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Name</p>
                                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email</p>
                                        <p className="text-sm text-gray-700">{user.email}</p>
                                    </div>
                                    {profile?.commission_rate && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Commission Rate</p>
                                            <p className="text-sm font-semibold text-gray-900">{profile.commission_rate}%</p>
                                        </div>
                                    )}
                                    {profile?.status && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Store Status</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                profile.status === 'approved'  ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'  :
                                                profile.status === 'suspended' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20'        :
                                                                                  'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20'
                                            }`}>
                                                {profile.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>

                            {/* Sidebar save button */}
                            <PrimaryButton type="submit" loading={processing} loadingText="Saving..." className="w-full justify-center">
                                Save Changes
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </form>
        </VendorLayout>
    );
}