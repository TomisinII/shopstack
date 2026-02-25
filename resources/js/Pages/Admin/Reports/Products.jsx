import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { StatCard, ReportHeader, SectionCard, formatCurrency } from '@/Pages/Admin/Reports/ReportComponents';
import { StockBadge } from '@/Components';

export default function Products({ bestSellers, worstPerformers, lowStock, byCategory, range }) {
    return (
        <AdminLayout>
            <Head title="Products Report" />

            <div className="space-y-6">
                <ReportHeader
                    title="Products Report"
                    description="Best sellers, worst performers, and inventory health"
                    range={range}
                    routeName="admin.reports.products"
                />

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Best Seller Units"
                        value={bestSellers[0]?.units_sold?.toLocaleString() ?? '—'}
                        color="text-amber-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                    />
                    <StatCard
                        title="Best Seller Revenue"
                        value={formatCurrency(bestSellers[0]?.revenue)}
                        color="text-green-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Low Stock Products"
                        value={lowStock.length.toLocaleString()}
                        color="text-amber-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    />
                    <StatCard
                        title="Zero Sales Products"
                        value={worstPerformers.length.toLocaleString()}
                        color="text-red-700"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Best Sellers */}
                    <SectionCard title="Best Sellers" description={`Top products by units sold in the last ${range} days`}>
                        {bestSellers.length > 0 ? (
                            <div className="space-y-0 -mx-6 -mb-6">
                                {bestSellers.map((product, i) => (
                                    <div key={product.product_id} className="flex items-center gap-4 px-6 py-4 border-t border-gray-50 first:border-0">
                                        <span className="text-sm font-bold text-gray-400 w-5 flex-shrink-0">{i + 1}</span>
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                            {product.image ? (
                                                <img src={product.image} alt={product.product_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{product.product_name}</p>
                                            <p className="text-xs text-gray-400">{product.units_sold.toLocaleString()} units sold</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatCurrency(product.revenue)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-8">No sales data in this period</p>
                        )}
                    </SectionCard>

                    {/* Revenue by Category */}
                    <SectionCard title="Revenue by Category" description="Total revenue per product category">
                        {byCategory.length > 0 ? (
                            <div className="space-y-3">
                                {(() => {
                                    const max = Math.max(...byCategory.map((c) => c.revenue), 1);
                                    return byCategory.map((cat, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-700">{cat.category}</span>
                                                <span className="text-sm font-semibold text-gray-900">{formatCurrency(cat.revenue)}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary-500 h-1.5 rounded-full transition-all"
                                                    style={{ width: `${(cat.revenue / max) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{cat.units.toLocaleString()} units</p>
                                        </div>
                                    ));
                                })()}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-8">No category data available</p>
                        )}
                    </SectionCard>
                </div>

                {/* Low Stock */}
                {lowStock.length > 0 && (
                    <SectionCard title="Low Stock Alert" description="Published products at or below their low-stock threshold">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {['Product', 'SKU', 'Stock', 'Status'].map((h) => (
                                            <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lowStock.map((p) => (
                                        <tr key={p.id}>
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                        {p.image ? (
                                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-900 truncate max-w-[180px]">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-gray-400 text-xs">{p.sku ?? '—'}</td>
                                            <td className="py-3">
                                                <span className={`font-semibold ${p.stock_quantity <= 0 ? 'text-red-600' : 'text-amber-600'}`}>
                                                    {p.stock_quantity} / {p.threshold}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <StockBadge quantity={p.stock_quantity} status={p.stock_status} threshold={p.threshold} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* Worst Performers */}
                {worstPerformers.length > 0 && (
                    <SectionCard title="Zero Sales Products" description="Published products with no sales in this period">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {worstPerformers.map((product) => (
                                <div key={product.product_id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                                    <div className="w-9 h-9 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                        {product.image ? (
                                            <img src={product.image} alt={product.product_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-base">📦</div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 truncate">{product.product_name}</p>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}
            </div>
        </AdminLayout>
    );
}