import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import {
    PrimaryButton,
    SecondaryButton,
    DangerButton,
    InputLabel,
    TextInput,
    SelectInput,
    SectionCard,
    ConfirmModal,
} from '@/Components';

const ADDRESS_TYPES = [
    { value: 'shipping', label: 'Shipping' },
    { value: 'billing',  label: 'Billing'  },
    { value: 'both',     label: 'Both'     },
];

const EMPTY_FORM = {
    type: 'shipping',
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Nigeria',
    is_default: false,
};

export default function Index({ addresses }) {
    const { flash, errors } = usePage().props;

    const [showForm, setShowForm]         = useState(false);
    const [editing, setEditing]           = useState(null);  
    const [form, setForm]                 = useState(EMPTY_FORM);
    const [processing, setProcessing]     = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting]         = useState(false);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const openEdit = (address) => {
        setEditing(address);
        setForm({
            type:            address.type,
            full_name:       address.full_name,
            phone:           address.phone,
            address_line_1:  address.address_line_1,
            address_line_2:  address.address_line_2 ?? '',
            city:            address.city,
            state:           address.state,
            zip_code:        address.zip_code,
            country:         address.country,
            is_default:      address.is_default,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(EMPTY_FORM);
    };

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const options = {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => closeForm(),
        };

        if (editing) {
            router.put(route('account.addresses.update', editing.id), form, options);
        } else {
            router.post(route('account.addresses.store'), form, options);
        }
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('account.addresses.destroy', deleteTarget.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    const setDefault = (address) => {
        router.post(route('account.addresses.setDefault', address.id), {}, { preserveScroll: true });
    };

    return (
        <CustomerLayout>
            <Head title="My Addresses" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage your saved shipping and billing addresses</p>
                    </div>
                    <PrimaryButton onClick={openCreate}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Address
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

                {/* Add / Edit Form */}
                {showForm && (
                    <SectionCard
                        title={editing ? 'Edit Address' : 'New Address'}
                        description={editing ? 'Update the details below.' : 'Fill in the details to save a new address.'}
                        action={
                            <button onClick={closeForm} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        }
                    >
                        <form onSubmit={submit} className="space-y-4">
                            {/* Type */}
                            <div>
                                <InputLabel htmlFor="type" required>Address Type</InputLabel>
                                <SelectInput
                                    id="type"
                                    value={form.type}
                                    onChange={(e) => set('type', e.target.value)}
                                    options={ADDRESS_TYPES}
                                    placeholder={null}
                                    error={errors?.type}
                                />
                            </div>

                            {/* Name + Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="full_name" required>Full Name</InputLabel>
                                    <TextInput
                                        id="full_name"
                                        type="text"
                                        value={form.full_name}
                                        onChange={(e) => set('full_name', e.target.value)}
                                        placeholder="John Doe"
                                        error={errors?.full_name}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="phone" required>Phone Number</InputLabel>
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => set('phone', e.target.value)}
                                        placeholder="+234 800 000 0000"
                                        error={errors?.phone}
                                    />
                                </div>
                            </div>

                            {/* Address lines */}
                            <div>
                                <InputLabel htmlFor="address_line_1" required>Address Line 1</InputLabel>
                                <TextInput
                                    id="address_line_1"
                                    type="text"
                                    value={form.address_line_1}
                                    onChange={(e) => set('address_line_1', e.target.value)}
                                    placeholder="Street address, P.O. box"
                                    error={errors?.address_line_1}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="address_line_2">Address Line 2 <span className="text-gray-400 font-normal">(optional)</span></InputLabel>
                                <TextInput
                                    id="address_line_2"
                                    type="text"
                                    value={form.address_line_2}
                                    onChange={(e) => set('address_line_2', e.target.value)}
                                    placeholder="Apartment, suite, unit, building, floor"
                                />
                            </div>

                            {/* City / State / Zip */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <InputLabel htmlFor="city" required>City</InputLabel>
                                    <TextInput
                                        id="city"
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => set('city', e.target.value)}
                                        placeholder="Lagos"
                                        error={errors?.city}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="state" required>State</InputLabel>
                                    <TextInput
                                        id="state"
                                        type="text"
                                        value={form.state}
                                        onChange={(e) => set('state', e.target.value)}
                                        placeholder="Lagos"
                                        error={errors?.state}
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="zip_code" required>ZIP / Postal Code</InputLabel>
                                    <TextInput
                                        id="zip_code"
                                        type="text"
                                        value={form.zip_code}
                                        onChange={(e) => set('zip_code', e.target.value)}
                                        placeholder="100001"
                                        error={errors?.zip_code}
                                    />
                                </div>
                            </div>

                            {/* Country */}
                            <div>
                                <InputLabel htmlFor="country" required>Country</InputLabel>
                                <TextInput
                                    id="country"
                                    type="text"
                                    value={form.country}
                                    onChange={(e) => set('country', e.target.value)}
                                    placeholder="Nigeria"
                                    error={errors?.country}
                                />
                            </div>

                            {/* Default toggle */}
                            <label className="flex items-center gap-3 cursor-pointer select-none group">
                                <input
                                    type="checkbox"
                                    checked={form.is_default}
                                    onChange={(e) => set('is_default', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-colors cursor-pointer"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Set as default address</p>
                                    <p className="text-xs text-gray-400">This address will be pre-selected at checkout</p>
                                </div>
                            </label>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <SecondaryButton type="button" onClick={closeForm} disabled={processing}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" loading={processing} loadingText="Saving...">
                                    {editing ? 'Update Address' : 'Save Address'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </SectionCard>
                )}

                {/* Address Cards */}
                {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`bg-white rounded-xl border shadow-sm p-6 flex flex-col gap-4 transition-all ${
                                    address.is_default ? 'border-primary-200 ring-1 ring-primary-200' : 'border-gray-100'
                                }`}
                            >
                                {/* Type + Default badge */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 capitalize">
                                        {address.type}
                                    </span>
                                    {address.is_default && (
                                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700 ring-1 ring-green-600/20">
                                            Default
                                        </span>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <p className="text-base font-semibold text-gray-900">{address.full_name}</p>
                                    <div className="mt-1.5 space-y-0.5">
                                        <p className="text-sm text-gray-500">
                                            {[address.address_line_1, address.address_line_2].filter(Boolean).join(', ')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {[address.city, address.state, address.zip_code].filter(Boolean).join(', ')}
                                        </p>
                                        <p className="text-sm text-gray-500">{address.country}</p>
                                        <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-100" />

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <SecondaryButton size="sm" onClick={() => openEdit(address)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </SecondaryButton>
                                    <DangerButton size="sm" onClick={() => setDeleteTarget(address)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </DangerButton>
                                    {!address.is_default && (
                                        <button
                                            onClick={() => setDefault(address)}
                                            className="ml-auto text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                                        >
                                            Set as default
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty state */
                    !showForm && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">No saved addresses</p>
                            <p className="text-xs text-gray-400 mt-1 mb-5">Add an address to speed up checkout</p>
                            <PrimaryButton onClick={openCreate}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Your First Address
                            </PrimaryButton>
                        </div>
                    )
                )}
            </div>

            {/* Delete confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Address"
                message={
                    deleteTarget
                        ? `Remove the address at "${deleteTarget.address_line_1}"? This cannot be undone.`
                        : ''
                }
                confirmText="Delete Address"
            />
        </CustomerLayout>
    );
}