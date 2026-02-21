export default function StatCard({ title, value, subtitle, icon, trend, bgColor = 'bg-white' }) {
    return (
        <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="text-2xl">{icon}</div>
                        {trend && (
                            <span className={`text-sm font-medium ${
                                trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {trend}
                            </span>
                        )}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
                    <p className="text-sm text-gray-600">{title}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
}