import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { BarChart, StatCard, ReportHeader, SectionCard, formatCurrency } from '@/Pages/Admin/Reports/ReportComponents';

export default function Sales({ dailySales, stats, byPayment, range }) {
    return (
        <AdminLayout>
            <Head title="Sales Report" />

            <div className="space-y-6">
                <ReportHeader
                    title="Sales Report"
                    description="Revenue, orders, and sales trends"
                    range={range}
                    routeName="admin.reports.sales"
                />

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.total_revenue)}
                        color="text-green-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats.total_orders.toLocaleString()}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    />
                    <StatCard
                        title="Avg. Order Value"
                        value={formatCurrency(stats.average_order)}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                    />
                    <StatCard
                        title="Total Discounts"
                        value={formatCurrency(stats.total_discount)}
                        color="text-amber-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                    />
                </div>

                {/* Revenue chart */}
                <SectionCard title="Daily Revenue" description="Paid orders only">
                    <BarChart
                        data={dailySales}
                        xKey="date"
                        yKey="revenue"
                        color="bg-primary-500"
                        formatY={formatCurrency}
                    />
                </SectionCard>

                {/* Orders chart */}
                <SectionCard title="Daily Orders" description="Number of paid orders per day">
                    <BarChart
                        data={dailySales}
                        xKey="date"
                        yKey="orders"
                        color="bg-indigo-400"
                        formatY={(v) => v + ' orders'}
                    />
                </SectionCard>

                {/* Payment method breakdown */}
                <SectionCard title="Revenue by Payment Method">
                    {byPayment.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                                        <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</th>
                                        <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {byPayment.map((row, i) => (
                                        <tr key={i}>
                                            <td className="py-3 font-medium capitalize text-gray-800">{row.method}</td>
                                            <td className="py-3 text-right text-gray-600">{row.orders.toLocaleString()}</td>
                                            <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(row.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-8">No data available</p>
                    )}
                </SectionCard>
            </div>
        </AdminLayout>
    );
}