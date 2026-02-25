import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { StatCard, ReportHeader, SectionCard, formatCurrency } from '@/Pages/Admin/Reports/ReportComponents';

export default function Tax({ byDate, byState, stats, range }) {
    return (
        <AdminLayout>
            <Head title="Tax Report" />

            <div className="space-y-6">
                <ReportHeader
                    title="Tax Report"
                    description="Tax collected by date and shipping location"
                    range={range}
                    routeName="admin.reports.tax"
                />

                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        title="Total Tax Collected"
                        value={formatCurrency(stats.total_tax)}
                        color="text-gray-900"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    />
                    <StatCard
                        title="Taxed Orders"
                        value={stats.taxed_orders.toLocaleString()}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                    />
                    <StatCard
                        title="Avg. Tax Rate"
                        value={`${(stats.avg_tax_rate ?? 0).toFixed(1)}%`}
                        color="text-indigo-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SectionCard title="Tax by Date" description="Daily tax collection">
                        {byDate.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            {['Date', 'Orders', 'Tax Collected'].map((h, i) => (
                                                <th key={h} className={`pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {byDate.map((row, i) => (
                                            <tr key={i}>
                                                <td className="py-3 text-gray-700">{row.date}</td>
                                                <td className="py-3 text-right text-gray-500">{row.orders}</td>
                                                <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(row.tax)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-8">No tax data for this period</p>
                        )}
                    </SectionCard>

                    <SectionCard title="Tax by State/Region" description="Tax grouped by shipping destination">
                        {byState.length > 0 ? (
                            <div className="space-y-3">
                                {(() => {
                                    const max = Math.max(...byState.map((s) => s.tax), 1);
                                    return byState.map((row, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-700">{row.state || 'Unknown'}</span>
                                                <span className="text-sm font-semibold text-gray-900">{formatCurrency(row.tax)}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: `${(row.tax / max) * 100}%` }} />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{row.orders} orders</p>
                                        </div>
                                    ));
                                })()}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-8">No location data available</p>
                        )}
                    </SectionCard>
                </div>
            </div>
        </AdminLayout>
    );
}