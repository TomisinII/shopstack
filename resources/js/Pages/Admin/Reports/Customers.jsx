import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { BarChart, StatCard, ReportHeader, SectionCard, formatCurrency } from '@/Pages/Admin/Reports/ReportComponents';
import { Avatar } from '@/Components';

export default function Customers({ newCustomers, topCustomers, stats, range }) {
    return (
        <AdminLayout>
            <Head title="Customers Report" />

            <div className="space-y-6">
                <ReportHeader
                    title="Customers Report"
                    description="New customers, top spenders, and retention metrics"
                    range={range}
                    routeName="admin.reports.customers"
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="New Customers"
                        value={stats.new_customers.toLocaleString()}
                        color="text-blue-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
                    />
                    <StatCard
                        title="Total Customers"
                        value={stats.total_customers.toLocaleString()}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    />
                    <StatCard
                        title="Avg. Order Value"
                        value={formatCurrency(stats.avg_order_value)}
                        color="text-green-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                    />
                    <StatCard
                        title="Repeat Buyers"
                        value={stats.repeat_buyers.toLocaleString()}
                        color="text-indigo-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                    />
                </div>

                <SectionCard title="New Customers Over Time" description="Registrations per day">
                    <BarChart data={newCustomers} xKey="date" yKey="count" color="bg-blue-400" formatY={(v) => v + ' customers'} />
                </SectionCard>

                <SectionCard title="Top Customers by Lifetime Value">
                    {topCustomers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {['#', 'Customer', 'Member Since', 'Orders', 'Lifetime Value'].map((h, i) => (
                                            <th key={h} className={`pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {topCustomers.map((c, i) => (
                                        <tr key={c.user_id}>
                                            <td className="py-3 text-sm text-gray-400 font-medium w-8">{i + 1}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={c.name} />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{c.name}</p>
                                                        <p className="text-xs text-gray-400">{c.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-gray-500">{c.member_since}</td>
                                            <td className="py-3 text-right text-gray-600">{c.order_count}</td>
                                            <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(c.lifetime_value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-8">No customer data in this period</p>
                    )}
                </SectionCard>
            </div>
        </AdminLayout>
    );
}