export default function StockBadge({ quantity, status, threshold = 10, mode = 'badge', className = '' }) {
    const isOut = status === 'out_of_stock' || quantity <= 0;
    const isLow = !isOut && quantity <= threshold;

    if (mode === 'inline') {
        const color = isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-green-600';
        return (
            <span className={`text-sm font-semibold ${color} ${className}`}>
                {isOut ? 'Out of stock' : quantity}
            </span>
        );
    }

    // Badge mode
    if (isOut) {
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-red-600/20 ${className}`}>
                Out of Stock
            </span>
        );
    }
    if (isLow) {
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ${className}`}>
                Low Stock ({quantity})
            </span>
        );
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-600/20 ${className}`}>
            In Stock ({quantity})
        </span>
    );
}