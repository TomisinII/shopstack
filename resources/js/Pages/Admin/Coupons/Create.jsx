import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PrimaryButton, SectionCard, InputLabel, TextInput, SelectInput, Toggle } from '@/Components';

function generateCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function CouponCreate() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        minimum_order_amount: '',
        maximum_discount: '',
        usage_limit: '',
        usage_limit_per_user: 1,
        valid_from: '',
        valid_until: '',
        is_active: true,
    });

    const isPercentage = data.type === 'percentage';
    const isFreeShipping = data.type === 'free_shipping';

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.coupons.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Coupon" />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Link href={route('admin.coupons.index')} className="hover:text-primary-600 transition-colors">
                    Coupons
                </Link>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700 font-medium">Create Coupon</span>
            </nav>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
                <p className="text-sm text-gray-500 mt-0.5">Add a new discount coupon for your customers</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* ── Left col ── */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Details */}
                        <SectionCard title="Coupon Details" description="Basic information about this coupon.">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Code */}
                                <div>
                                    <InputLabel htmlFor="code" required>Coupon Code</InputLabel>
                                    <div className="flex gap-2">
                                        <TextInput
                                            id="code"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            placeholder="e.g. SAVE20"
                                            className="font-mono tracking-widest uppercase"
                                            error={errors.code}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setData('code', generateCode())}
                                            title="Auto-generate"
                                            className="flex-shrink-0 px-3 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Type */}
                                <div>
                                    <InputLabel htmlFor="type" required>Discount Type</InputLabel>
                                    <SelectInput
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => {
                                            setData('type', e.target.value);
                                            if (e.target.value === 'free_shipping') setData('value', 0);
                                        }}
                                        error={errors.type}
                                        options={[
                                            { value: 'percentage',    label: 'Percentage (%)' },
                                            { value: 'fixed',         label: 'Fixed Amount (₦)' },
                                            { value: 'free_shipping', label: 'Free Shipping' },
                                        ]}
                                        placeholder={null}
                                    />
                                </div>
                            </div>

                            {!isFreeShipping && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                                    <div>
                                        <InputLabel htmlFor="value" required>
                                            {isPercentage ? 'Discount Percentage' : 'Discount Amount (₦)'}
                                        </InputLabel>
                                        <div className="relative">
                                            {!isPercentage && (
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">₦</span>
                                            )}
                                            <TextInput
                                                id="value"
                                                type="number"
                                                min="0"
                                                max={isPercentage ? 100 : undefined}
                                                step={isPercentage ? '1' : '0.01'}
                                                value={data.value}
                                                onChange={(e) => setData('value', e.target.value)}
                                                className={!isPercentage ? 'pl-7' : ''}
                                                error={errors.value}
                                            />
                                            {isPercentage && (
                                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">%</span>
                                            )}
                                        </div>
                                    </div>

                                    {isPercentage && (
                                        <div>
                                            <InputLabel htmlFor="maximum_discount">
                                                Max Discount Cap (₦) <span className="text-gray-400 font-normal">(optional)</span>
                                            </InputLabel>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">₦</span>
                                                <TextInput
                                                    id="maximum_discount"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.maximum_discount}
                                                    onChange={(e) => setData('maximum_discount', e.target.value)}
                                                    className="pl-7"
                                                    placeholder="No cap"
                                                    error={errors.maximum_discount}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-1">
                                <InputLabel htmlFor="minimum_order_amount">
                                    Minimum Order Amount (₦) <span className="text-gray-400 font-normal">(optional)</span>
                                </InputLabel>
                                <div className="relative max-w-xs">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">₦</span>
                                    <TextInput
                                        id="minimum_order_amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.minimum_order_amount}
                                        onChange={(e) => setData('minimum_order_amount', e.target.value)}
                                        className="pl-7"
                                        placeholder="No minimum"
                                        error={errors.minimum_order_amount}
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Usage limits */}
                        <SectionCard title="Usage Limits" description="Control how many times this coupon can be used.">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <InputLabel htmlFor="usage_limit">
                                        Total Usage Limit <span className="text-gray-400 font-normal">(optional)</span>
                                    </InputLabel>
                                    <TextInput
                                        id="usage_limit"
                                        type="number"
                                        min="1"
                                        value={data.usage_limit}
                                        onChange={(e) => setData('usage_limit', e.target.value)}
                                        placeholder="Unlimited"
                                        error={errors.usage_limit}
                                    />
                                    <p className="mt-1.5 text-xs text-gray-400">Leave empty for unlimited uses</p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="usage_limit_per_user">Limit Per Customer</InputLabel>
                                    <TextInput
                                        id="usage_limit_per_user"
                                        type="number"
                                        min="1"
                                        value={data.usage_limit_per_user}
                                        onChange={(e) => setData('usage_limit_per_user', e.target.value)}
                                        error={errors.usage_limit_per_user}
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Validity */}
                        <SectionCard title="Validity Period" description="Set when this coupon becomes active and when it expires.">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <InputLabel htmlFor="valid_from">
                                        Start Date <span className="text-gray-400 font-normal">(optional)</span>
                                    </InputLabel>
                                    <TextInput
                                        id="valid_from"
                                        type="date"
                                        value={data.valid_from}
                                        onChange={(e) => setData('valid_from', e.target.value)}
                                        error={errors.valid_from}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="valid_until">
                                        Expiry Date <span className="text-gray-400 font-normal">(optional)</span>
                                    </InputLabel>
                                    <TextInput
                                        id="valid_until"
                                        type="date"
                                        value={data.valid_until}
                                        onChange={(e) => setData('valid_until', e.target.value)}
                                        error={errors.valid_until}
                                    />
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* ── Right col ── */}
                    <div className="space-y-6">
                        <SectionCard title="Status">
                            <Toggle
                                id="is_active"
                                label="Active"
                                description="Customers can apply this coupon at checkout"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                        </SectionCard>

                        {/* Live preview */}
                        <SectionCard title="Preview">
                            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-5 text-center space-y-2">
                                <p className="font-mono text-lg font-black tracking-widest text-gray-900">
                                    {data.code || '—'}
                                </p>
                                <p className="text-2xl font-bold text-primary-600">
                                    {isFreeShipping
                                        ? 'Free Shipping'
                                        : data.value
                                        ? isPercentage
                                            ? `${data.value}% OFF`
                                            : `₦${Number(data.value || 0).toLocaleString()} OFF`
                                        : '—'
                                    }
                                </p>
                                {data.minimum_order_amount && (
                                    <p className="text-xs text-gray-400">
                                        Min. order ₦{Number(data.minimum_order_amount).toLocaleString()}
                                    </p>
                                )}
                                {data.valid_until && (
                                    <p className="text-xs text-gray-400">
                                        Expires {new Date(data.valid_until).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                )}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${data.is_active ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-gray-100 text-gray-500 ring-1 ring-gray-400/20'}`}>
                                    {data.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </SectionCard>

                        <PrimaryButton type="submit" loading={processing} loadingText="Creating..." className="w-full justify-center">
                            Create Coupon
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}