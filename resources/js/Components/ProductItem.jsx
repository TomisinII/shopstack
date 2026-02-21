export default function ProductItem({ rank, image, name, salesCount, revenue }) {
    return (
        <div className="flex items-center gap-4 py-3">
            <span className="text-gray-500 font-medium text-sm w-6">{rank}</span>
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
                <p className="text-xs text-gray-500">{salesCount} sold</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{revenue}</p>
            </div>
        </div>
    );
}