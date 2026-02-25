import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { StatCard, ReportHeader, SectionCard, formatCurrency } from '@/Pages/Admin/Reports/ReportComponents';
import { Avatar } from '@/Components';

export default function Vendors({ topVendors, stats, range }) {
    return (
        <AdminLayout>
            <Head title="Vendors Report" />

            <div className="space-y-6">
                <ReportHeader
                    title="Vendors Report"
                    description="Top vendors, commission totals, and payout tracking"
                    range={range}
                    routeName="admin.reports.vendors"
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Gross Sales"
                        value={formatCurrency(stats.total_gross)}
                        color="text-green-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Platform Commission"
                        value={formatCurrency(stats.total_commission)}
                        color="text-indigo-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    />
                    <StatCard
                        title="Total Payouts"
                        value={formatCurrency(stats.total_payouts)}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    />
                    <StatCard
                        title="Pending Payouts"
                        value={formatCurrency(stats.pending_payouts)}
                        color="text-amber-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>

                <SectionCard title="Top Vendors" description="Ranked by gross sales in this period">
                    {topVendors.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {['#', 'Vendor', 'Sales', 'Gross', 'Commission', 'Net Earnings'].map((h, i) => (
                                            <th key={h} className={`pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {topVendors.map((v, i) => (
                                        <tr key={v.vendor_id}>
                                            <td className="py-3 text-gray-400 font-medium w-8">{i + 1}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={v.name} />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{v.name}</p>
                                                        <p className="text-xs text-gray-400">{v.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right text-gray-600">{v.sales}</td>
                                            <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(v.gross)}</td>
                                            <td className="py-3 text-right text-red-600">- {formatCurrency(v.commission)}</td>
                                            <td className="py-3 text-right font-semibold text-green-700">{formatCurrency(v.net)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-8">No vendor activity in this period</p>
                    )}
                </SectionCard>
            </div>
        </AdminLayout>
    );
}