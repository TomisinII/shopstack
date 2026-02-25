import { useState } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import VendorLayout from '@/Layouts/VendorLayout';
import {
    StatusBadge,
    InfoRow,
    SectionCard,
    SecondaryButton,
    PrimaryButton,
    InputLabel,
    TextInput,
    SelectInput,
} from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

// Timeline steps for order progress
const TIMELINE_STEPS = [
    { key: 'pending',    label: 'Order Placed'  },
    { key: 'processing', label: 'Processing'    },
    { key: 'shipped',    label: 'Shipped'       },
    { key: 'delivered',  label: 'Delivered'     },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

function OrderTimeline({ status }) {
    const currentIndex = STATUS_ORDER.indexOf(status);
    const isCancelled  = status === 'cancelled' || status === 'refunded';

    if (isCancelled) {
        return (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-medium text-red-700 capitalize">{status}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-0">
            {TIMELINE_STEPS.map((step, i) => {
                const done    = i <= currentIndex;
                const active  = i === currentIndex;
                const isLast  = i === TIMELINE_STEPS.length - 1;

                return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                done
                                    ? active
                                        ? 'bg-primary-600 ring-4 ring-primary-100'
                                        : 'bg-primary-600'
                                    : 'bg-gray-100'
                            }`}>
                                {done && !active ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <div className={`w-2.5 h-2.5 rounded-full ${done ? 'bg-white' : 'bg-gray-300'}`} />
                                )}
                            </div>
                            <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${done ? 'text-primary-700' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                        {!isLast && (
                            <div className={`flex-1 h-0.5 mb-5 mx-1 transition-all ${i < currentIndex ? 'bg-primary-500' : 'bg-gray-100'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function Show({ order }) {
    const { flash } = usePage().props;
    const [showStatusForm, setShowStatusForm] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        status:          order.status === 'processing' ? 'shipped' : 'processing',
        tracking_number: order.tracking_number ?? '',
    });

    const canUpdateStatus = ['pending', 'processing'].includes(order.status);

    const submitStatus = (e) => {
        e.preventDefault();
        patch(route('vendor.orders.update-status', order.id), {
            onSuccess: () => {
                setShowStatusForm(false);
                reset();
            },
        });
    };

    const shippingLines = [
        order.shipping_address_line_1,
        order.shipping_address_line_2,
        order.shipping_city,
        order.shipping_state,
        order.shipping_zip,
        order.shipping_country,
    ].filter(Boolean);

    return (
        <VendorLayout>
            <Head title={`Order ${order.order_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Link
                            href={route('vendor.orders.index')}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Placed {order.created_at}</p>
                        </div>
                        <StatusBadge status={order.status} />
                        <StatusBadge status={order.payment_status} />
                    </div>

                    {canUpdateStatus && (
                        <PrimaryButton onClick={() => setShowStatusForm((v) => !v)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Update Status
                        </PrimaryButton>
                    )}
                </div>

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

                {/* Update Status Form */}
                {showStatusForm && (
                    <div className="bg-white rounded-xl border border-primary-100 shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Update Order Status</h3>
                        <form onSubmit={submitStatus} className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <InputLabel htmlFor="status" required>New Status</InputLabel>
                                <SelectInput
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    options={[
                                        { value: 'processing', label: 'Processing' },
                                        { value: 'shipped',    label: 'Shipped'    },
                                    ]}
                                    placeholder={null}
                                    error={errors.status}
                                />
                            </div>
                            {data.status === 'shipped' && (
                                <div className="flex-1">
                                    <InputLabel htmlFor="tracking_number">Tracking Number</InputLabel>
                                    <TextInput
                                        id="tracking_number"
                                        type="text"
                                        value={data.tracking_number}
                                        onChange={(e) => setData('tracking_number', e.target.value)}
                                        placeholder="Enter tracking number"
                                        error={errors.tracking_number}
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-2 pb-0.5">
                                <PrimaryButton type="submit" loading={processing} loadingText="Saving...">
                                    Save
                                </PrimaryButton>
                                <SecondaryButton type="button" onClick={() => setShowStatusForm(false)}>
                                    Cancel
                                </SecondaryButton>
                            </div>
                        </form>
                    </div>
                )}

                {/* Timeline */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-5">Order Progress</h3>
                    <OrderTimeline status={order.status} />
                    {order.tracking_number && (
                        <p className="mt-4 text-sm text-gray-500">
                            Tracking: <span className="font-semibold text-gray-800">{order.tracking_number}</span>
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Items */}
                        <SectionCard
                            title="Your Items in This Order"
                            description={`${order.items.length} product${order.items.length !== 1 ? 's' : ''}`}
                        >
                            <div className="-mx-6 -mb-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 border-t border-gray-50 first:border-0">
                                        {/* Image */}
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                            {item.image ? (
                                                <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
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
                                            <p className="text-sm font-semibold text-gray-900 truncate">{item.product_name}</p>
                                            {item.variant_name && (
                                                <p className="text-xs text-gray-500 mt-0.5">{item.variant_name}</p>
                                            )}
                                            {item.product_sku && (
                                                <p className="text-xs text-gray-400 mt-0.5">SKU: {item.product_sku}</p>
                                            )}
                                        </div>

                                        {/* Qty × price */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm text-gray-500">
                                                {item.quantity} × {formatCurrency(item.unit_price)}
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                                {formatCurrency(item.subtotal)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Vendor subtotal footer */}
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Your Subtotal</span>
                                    <span className="text-base font-bold text-gray-900">{formatCurrency(order.vendor_subtotal)}</span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Shipping address */}
                        <SectionCard title="Shipping Address" description="Deliver to this address">
                            <dl>
                                <InfoRow label="Name"    value={order.shipping_full_name} />
                                <InfoRow label="Phone"   value={order.shipping_phone} />
                                <InfoRow label="Address" value={shippingLines.join(', ')} />
                            </dl>
                        </SectionCard>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Order summary */}
                        <SectionCard title="Order Summary">
                            <dl>
                                <InfoRow label="Order #"   value={order.order_number} />
                                <InfoRow label="Date"      value={order.created_at} />
                                <InfoRow label="Method"    value={order.payment_method?.toUpperCase()} />
                                {order.shipped_at  && <InfoRow label="Shipped"   value={order.shipped_at}  />}
                                {order.delivered_at && <InfoRow label="Delivered" value={order.delivered_at} />}
                            </dl>
                            <div className="pt-3 border-t border-gray-100 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Order Total</span>
                                    <span className="font-medium text-gray-800">{formatCurrency(order.total)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Your Subtotal</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(order.vendor_subtotal)}</span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Customer */}
                        <SectionCard title="Customer">
                            <dl>
                                <InfoRow label="Name"  value={order.customer.name} />
                                <InfoRow label="Email" value={order.customer.email} />
                            </dl>
                        </SectionCard>

                        {/* Customer note */}
                        {order.customer_notes && (
                            <SectionCard title="Customer Note">
                                <p className="text-sm text-gray-600 italic">"{order.customer_notes}"</p>
                            </SectionCard>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <SecondaryButton
                                onClick={() => router.visit(route('vendor.orders.index'))}
                                className="w-full justify-center"
                            >
                                Back to Orders
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
}