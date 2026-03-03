import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Step Indicator (all done) ────────────────────────────────────────────────

function StepIndicator() {
    const steps = ['Shipping', 'Payment', 'Confirmation'];
    return (
        <div className="flex items-center justify-center mb-10">
            {steps.map((label, i) => {
                const done   = i < 2;
                const active = i === 2;
                return (
                    <div key={label} className="flex items-center">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                                ${done   ? 'bg-green-500 text-white'
                                : active ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/25'
                                :          'bg-gray-100 text-gray-400'}`}>
                                {done ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : i + 1}
                            </div>
                            <span className={`text-sm font-medium ${active ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="w-16 sm:w-24 h-0.5 mx-3 bg-green-400" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Confirmation Page ────────────────────────────────────────────────────────

export default function Confirmation({ orderNumber, email, estimatedDelivery, orderId }) {
    const timeline = [
        { label: 'Order Placed', subtitle: 'Today',       done: true },
        { label: 'Processing',   subtitle: 'Tomorrow',    done: false },
        { label: 'Shipped',      subtitle: 'In 1-2 days', done: false },
        { label: 'Delivered',    subtitle: estimatedDelivery, done: false },
    ];

    return (
        <AppLayout>
            <Head title="Order Confirmed — ShopStack" />

            <div className="min-h-screen bg-gray-50/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <StepIndicator />

                    {/* Confirmation card — centered, narrower */}
                    <div className="max-w-xl mx-auto text-center space-y-6">

                        {/* Success icon */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-900/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Heading */}
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                                Thank You for Your Order!
                            </h1>
                            <p className="text-gray-500 text-sm">
                                We've sent a confirmation email to{' '}
                                <span className="font-bold text-gray-900">{email}</span>
                            </p>
                        </div>

                        {/* Order number pill */}
                        <div className="inline-block px-6 py-3 bg-primary-50 border border-primary-100 rounded-2xl">
                            <span className="text-base font-bold text-primary-600 tracking-wide">{orderNumber}</span>
                        </div>

                        {/* Estimated delivery */}
                        <p className="text-sm text-gray-500">
                            Estimated delivery: <span className="font-semibold text-gray-700">{estimatedDelivery}</span>
                        </p>

                        {/* What's Next timeline */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-left">
                            <h2 className="text-sm font-bold text-gray-900 mb-5">What's Next</h2>
                            <div className="space-y-0">
                                {timeline.map((step, i) => (
                                    <div key={step.label} className="flex items-start gap-4">
                                        {/* Icon + line */}
                                        <div className="flex flex-col items-center flex-shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                                                ${step.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                {step.done ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : i + 1}
                                            </div>
                                            {i < timeline.length - 1 && (
                                                <div className={`w-0.5 h-8 mt-1 ${step.done ? 'bg-green-300' : 'bg-gray-200'}`} />
                                            )}
                                        </div>

                                        {/* Label */}
                                        <div className="pb-6 last:pb-0">
                                            <p className={`text-sm font-semibold ${step.done ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {step.label}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{step.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <Link
                                href={route('account.orders.index')}
                                className="px-6 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/20"
                            >
                                Track Order
                            </Link>
                            <Link
                                href={route('shop.index')}
                                className="px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}