import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    StatusBadge,
    InfoRow,
    SectionCard,
    DangerButton,
    SelectInput,
    TextInput,
    TextArea,
    InputLabel,
    ConfirmModal
} from '@/Components';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function Show({ order }) {
    const { flash } = usePage().props;
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const { data, setData, patch, processing } = useForm({
        status: order.status,
        payment_status: order.payment_status,
        tracking_number: order.tracking_number ?? '',
        admin_notes: order.admin_notes ?? '',
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        patch(route('admin.orders.update', order.id), { preserveScroll: true });
    };

    const confirmCancel = () => {
        setCancelling(true);
        router.post(route('admin.orders.cancel', order.id), {}, {
            onFinish: () => {
                setCancelling(false);
                setShowCancelModal(false);
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleEmail = () => {
        router.post(route('admin.orders.notify', order.id), {}, { preserveScroll: true });
    };

    // Timeline step index for progress indicator
    const currentStepIndex = STATUS_STEPS.indexOf(order.status);
    const isCancelledOrRefunded = ['cancelled', 'refunded'].includes(order.status);

    return (
        <AdminLayout>
            <Head title={`Order ${order.order_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.orders.index')}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
                                <StatusBadge status={order.status} />
                                <StatusBadge status={order.payment_status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">Placed on {order.created_at}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Print packing slip"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                        <button
                            onClick={handleEmail}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Send email notification"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Notify Customer
                        </button>
                        {order.can_cancel && (
                            <DangerButton onClick={() => setShowCancelModal(true)}>
                                Cancel Order
                            </DangerButton>
                        )}
                    </div>
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        {flash.error}
                    </div>
                )}

                {/* Status timeline */}
                {!isCancelledOrRefunded && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between relative">
                            {/* Progress bar */}
                            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 mx-8" aria-hidden="true">
                                <div
                                    className="h-full bg-primary-600 transition-all duration-500"
                                    style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                                />
                            </div>

                            {STATUS_STEPS.map((step, i) => {
                                const isDone    = i < currentStepIndex;
                                const isCurrent = i === currentStepIndex;
                                return (
                                    <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                            isDone    ? 'bg-primary-600 border-primary-600'
                                            : isCurrent ? 'bg-white border-primary-600'
                                            : 'bg-white border-gray-200'
                                        }`}>
                                            {isDone ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-primary-600' : 'bg-gray-300'}`} />
                                            )}
                                        </div>
                                        <span className={`text-xs font-medium capitalize ${isCurrent ? 'text-primary-600' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {isCancelledOrRefunded && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-700 font-medium capitalize">
                            This order has been {order.status}.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Main column ─────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order items */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Order Items <span className="text-gray-400 font-normal">({order.items.length})</span>
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                                        {/* Image */}
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                            {item.product_image ? (
                                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{item.product_name}</p>
                                            {item.product_sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {item.product_sku}</p>}
                                        </div>

                                        {/* Qty × price */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm text-gray-500">
                                                {item.quantity} × {formatCurrency(item.unit_price)}
                                            </p>
                                            <p className="text-sm font-bold text-gray-900 mt-0.5">{formatCurrency(item.subtotal)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order summary totals */}
                            <div className="border-t border-gray-100 px-6 py-4 space-y-2">
                                {[
                                    { label: 'Subtotal',  value: formatCurrency(order.subtotal) },
                                    { label: 'Shipping',  value: order.shipping_cost > 0 ? formatCurrency(order.shipping_cost) : 'Free' },
                                    { label: 'Tax',       value: formatCurrency(order.tax_amount) },
                                    ...(order.discount_amount > 0 ? [{ label: `Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}`, value: `−${formatCurrency(order.discount_amount)}`, red: true }] : []),
                                ].map(({ label, value, red }) => (
                                    <div key={label} className="flex justify-between text-sm">
                                        <span className="text-gray-500">{label}</span>
                                        <span className={red ? 'text-green-600 font-medium' : 'text-gray-700'}>{value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer & address */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <SectionCard title="Customer">
                                <dl>
                                    <InfoRow label="Name"  value={order.customer.name} />
                                    <InfoRow label="Email" value={order.customer.email} />
                                    <InfoRow label="Phone" value={order.customer.phone} />
                                </dl>
                                <Link
                                    href={route('admin.customers.show', order.customer.id)}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    View customer profile →
                                </Link>
                            </SectionCard>

                            <SectionCard title="Shipping Address">
                                <div className="text-sm text-gray-700 space-y-0.5 leading-relaxed">
                                    <p className="font-semibold">{order.shipping_address.full_name}</p>
                                    <p>{order.shipping_address.address_line_1}</p>
                                    {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
                                    <p>{[order.shipping_address.city, order.shipping_address.state, order.shipping_address.zip].filter(Boolean).join(', ')}</p>
                                    <p>{order.shipping_address.country}</p>
                                    {order.shipping_address.phone && <p className="text-gray-500">{order.shipping_address.phone}</p>}
                                </div>
                            </SectionCard>
                        </div>

                        {/* Customer notes */}
                        {order.customer_notes && (
                            <SectionCard title="Customer Note">
                                <p className="text-sm text-gray-600 italic">"{order.customer_notes}"</p>
                            </SectionCard>
                        )}
                    </div>

                    {/* ── Sidebar ──────────────────────────────────── */}
                    <div className="space-y-6">

                        {/* Update order form */}
                        <form onSubmit={handleUpdate}>
                            <SectionCard
                                title="Update Order"
                                action={
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
                                    >
                                        {processing ? 'Saving...' : 'Save'}
                                    </button>
                                }
                            >
                                <div>
                                    <InputLabel htmlFor="status">Order Status</InputLabel>
                                    <SelectInput
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        options={[
                                            { value: 'pending',    label: 'Pending'    },
                                            { value: 'processing', label: 'Processing' },
                                            { value: 'shipped',    label: 'Shipped'    },
                                            { value: 'delivered',  label: 'Delivered'  },
                                            { value: 'cancelled',  label: 'Cancelled'  },
                                            { value: 'refunded',   label: 'Refunded'   },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="payment_status">Payment Status</InputLabel>
                                    <SelectInput
                                        id="payment_status"
                                        value={data.payment_status}
                                        onChange={(e) => setData('payment_status', e.target.value)}
                                        options={[
                                            { value: 'pending',  label: 'Pending'  },
                                            { value: 'paid',     label: 'Paid'     },
                                            { value: 'failed',   label: 'Failed'   },
                                            { value: 'refunded', label: 'Refunded' },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tracking_number">Tracking Number</InputLabel>
                                    <TextInput
                                        id="tracking_number"
                                        type="text"
                                        value={data.tracking_number}
                                        onChange={(e) => setData('tracking_number', e.target.value)}
                                        placeholder="Enter tracking number"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="admin_notes">Internal Notes</InputLabel>
                                    <TextArea
                                        id="admin_notes"
                                        rows={3}
                                        value={data.admin_notes}
                                        onChange={(e) => setData('admin_notes', e.target.value)}
                                        placeholder="Private notes (not visible to customer)"
                                    />
                                </div>
                            </SectionCard>
                        </form>

                        {/* Order meta */}
                        <SectionCard title="Order Details">
                            <dl>
                                <InfoRow label="Order #"   value={order.order_number} />
                                <InfoRow label="Placed"    value={order.created_at} />
                                <InfoRow label="Updated"   value={order.updated_at} />
                                <InfoRow label="Payment"   value={order.payment_method} />
                                {order.tracking_number && <InfoRow label="Tracking" value={order.tracking_number} />}
                                {order.shipped_at   && <InfoRow label="Shipped"   value={order.shipped_at} />}
                                {order.delivered_at && <InfoRow label="Delivered" value={order.delivered_at} />}
                            </dl>
                        </SectionCard>

                        {/* Danger zone */}
                        {order.can_cancel && (
                            <div className="bg-red-50 rounded-xl border border-red-100 p-4 space-y-3">
                                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Danger Zone</p>
                                <p className="text-xs text-red-600">Cancelling will return stock and cannot be undone.</p>
                                <DangerButton
                                    filled
                                    className="w-full justify-center"
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    Cancel Order
                                </DangerButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel confirmation modal */}
            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancel}
                loading={cancelling}
                title="Cancel Order"
                message={`Are you sure you want to cancel order ${order.order_number}? Stock will be returned to inventory and this action cannot be undone.`}
                confirmText="Yes, Cancel Order"
            />
        </AdminLayout>
    );
}