export default function InfoRow({ label, value, children, className = '' }) {
    const content = children ?? value;

    return (
        <div className={`flex items-start py-2.5 border-b border-gray-50 last:border-0 ${className}`}>
            <dt className="w-40 flex-shrink-0 text-xs font-medium text-gray-400 uppercase tracking-wide pt-0.5">
                {label}
            </dt>
            <dd className="flex-1 text-sm text-gray-700 min-w-0">
                {content !== undefined && content !== null && content !== ''
                    ? content
                    : <span className="text-gray-300">—</span>
                }
            </dd>
        </div>
    );
}