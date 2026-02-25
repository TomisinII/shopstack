import { Link, router } from '@inertiajs/react';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount ?? 0);

// Simple bar chart built with pure divs — no external chart lib needed.
function BarChart({ data, xKey, yKey, color = 'bg-primary-500', formatY }) {
    if (!data?.length) return <EmptyState />;
    const max = Math.max(...data.map((d) => d[yKey] ?? 0), 1);
    return (
        <div className="flex items-end gap-1 h-40 w-full">
            {data.map((item, i) => {
                const pct = ((item[yKey] ?? 0) / max) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                            className={`w-full rounded-t-sm ${color} transition-all`}
                            style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            {formatY ? formatY(item[yKey]) : item[yKey]}
                        </div>
                        {data.length <= 14 && (
                            <span className="text-[9px] text-gray-400 truncate max-w-full px-0.5">
                                {item[xKey]}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function EmptyState({ message = 'No data for this period' }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-gray-400">{message}</p>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, color = 'text-gray-900' }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                <span className="text-lg">{icon}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );
}

function RangeSelector({ range, routeName }) {
    const options = [
        { value: '7',  label: '7D'  },
        { value: '30', label: '30D' },
        { value: '90', label: '90D' },
        { value: '365', label: '1Y' },
    ];
    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => router.get(route(routeName), { range: opt.value }, { preserveState: true, replace: true })}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        String(range) === opt.value
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function ReportHeader({ title, description, range, routeName, backRoute = 'admin.reports.index' }) {
    return (
        <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
                <Link
                    href={route(backRoute)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <RangeSelector range={range} routeName={routeName} />
        </div>
    );
}

function SectionCard({ title, description, children, className = '' }) {
    return (
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

export { BarChart, EmptyState, StatCard, RangeSelector, ReportHeader, SectionCard, formatCurrency };