import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const REPORTS = [
    {
        key: 'sales',
        title: 'Sales Report',
        description: 'Revenue, orders, and sales trends',
        route: 'admin.reports.sales',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5-5 4 4 5.5-6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 6v6h-6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18" />
            </svg>
        ),
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
    },
    {
        key: 'products',
        title: 'Products Report',
        description: 'Best sellers, worst performers, low stock',
        route: 'admin.reports.products',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        color: 'text-violet-600',
        bg: 'bg-violet-50',
    },
    {
        key: 'customers',
        title: 'Customers Report',
        description: 'New customers, top customers, retention',
        route: 'admin.reports.customers',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        key: 'vendors',
        title: 'Vendors Report',
        description: 'Top vendors, commission totals, payouts',
        route: 'admin.reports.vendors',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    {
        key: 'tax',
        title: 'Tax Report',
        description: 'Tax collected by location and date',
        route: 'admin.reports.tax',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        color: 'text-gray-700',
        bg: 'bg-gray-100',
    },
    {
        key: 'coupons',
        title: 'Coupon Report',
        description: 'Redemption rates, discount totals',
        route: 'admin.reports.coupons',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
        ),
        color: 'text-red-600',
        bg: 'bg-red-50',
    },
];

export default function Index() {
    return (
        <AdminLayout>
            <Head title="Reports" />

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Generate detailed reports to gain insights into your store's performance.</p>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {REPORTS.map((report) => (
                        <Link
                            key={report.key}
                            href={route(report.route)}
                            className="group bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:border-gray-200 transition-all duration-200"
                        >
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl ${report.bg} ${report.color} flex items-center justify-center flex-shrink-0`}>
                                {report.icon}
                            </div>

                            {/* Text */}
                            <div className="flex-1">
                                <h2 className="text-base font-semibold text-gray-900">{report.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                            </div>

                            {/* CTA */}
                            <span className={`text-sm font-medium ${report.color} group-hover:underline`}>
                                Generate Report →
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}