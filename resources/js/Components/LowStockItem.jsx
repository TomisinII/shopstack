export default function LowStockItem({ image, name, sku, stockLeft, onRestock }) {
    return (
        <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {image ? (
                    <img 
                        src={image} 
                        alt={name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        📦
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                <p className="text-xs text-gray-500">{sku}</p>
            </div>
            <div className="text-right flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{stockLeft} left</span>
                <button
                    onClick={onRestock}
                    className="px-4 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Restock
                </button>
            </div>
        </div>
    );
}