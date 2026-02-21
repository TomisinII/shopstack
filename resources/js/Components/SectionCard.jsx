export default function SectionCard({ title, description, action, className = '', children }) {
    return (
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
                    {description && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
                {children}
            </div>
        </div>
    );
}