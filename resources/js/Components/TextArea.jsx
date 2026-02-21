export default function TextArea({ error, rows = 4, maxLength, className = '', value = '', ...props }) {
    return (
        <div>
            <textarea
                rows={rows}
                maxLength={maxLength}
                value={value}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-all resize-none
                    placeholder:text-gray-400
                    ${error
                        ? 'border-red-300 bg-red-50/30 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    } ${className}`}
                {...props}
            />
            <div className="flex items-center justify-between mt-1.5 min-h-[1rem]">
                {error ? (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                ) : (
                    <span />
                )}
                {maxLength && (
                    <p className={`text-xs tabular-nums ${String(value).length >= maxLength ? 'text-red-500' : 'text-gray-400'}`}>
                        {String(value).length}/{maxLength}
                    </p>
                )}
            </div>
        </div>
    );
}