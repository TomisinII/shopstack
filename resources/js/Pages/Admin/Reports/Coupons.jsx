import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { StatCard, ReportHeader, SectionCard, formatCurrency } from '@/Pages/Admin/Reports/ReportComponents';

export default function Coupons({ couponStats, stats, range }) {
    return (
        <AdminLayout>
            <Head title="Coupon Report" />

            <div className="space-y-6">
                <ReportHeader
                    title="Coupon Report"
                    description="Redemption rates, discount totals, and coupon performance"
                    range={range}
                    routeName="admin.reports.coupons"
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Discounts Given"
                        value={formatCurrency(stats.total_discount)}
                        color="text-red-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
                    />
                    <StatCard
                        title="Orders with Coupons"
                        value={stats.coupon_orders.toLocaleString()}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    />
                    <StatCard
                        title="Active Coupons"
                        value={stats.active_coupons.toLocaleString()}
                        color="text-green-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Total Redemptions"
                        value={stats.total_redemptions.toLocaleString()}
                        color="text-indigo-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                    />
                </div>

                <SectionCard title="Coupon Performance" description="Coupon usage in the selected period">
                    {couponStats.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {['Code', 'Type', 'Value', 'Uses (period)', 'Total Uses', 'Discount Given', 'Expires'].map((h, i) => (
                                            <th key={h} className={`pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {couponStats.map((c) => (
                                        <tr key={c.id}>
                                            <td className="py-3">
                                                <code className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-800">{c.code}</code>
                                            </td>
                                            <td className="py-3 capitalize text-gray-600">{c.type.replace('_', ' ')}</td>
                                            <td className="py-3 text-gray-700">
                                                {c.type === 'percentage'
                                                    ? `${c.value}%`
                                                    : c.type === 'free_shipping'
                                                    ? 'Free Ship'
                                                    : formatCurrency(c.value)}
                                            </td>
                                            <td className="py-3 text-right font-semibold text-gray-900">{c.uses_in_range}</td>
                                            <td className="py-3 text-right text-gray-500">
                                                {c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}
                                            </td>
                                            <td className="py-3 text-right font-semibold text-red-700">- {formatCurrency(c.discount_given)}</td>
                                            <td className="py-3 text-right text-xs text-gray-400">{c.valid_until ?? 'No expiry'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-8">No coupon redemptions in this period</p>
                    )}
                </SectionCard>
            </div>
        </AdminLayout>
    );
}