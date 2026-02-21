export default function SecondaryButton({
    type = 'button',
    disabled = false,
    loading = false,
    loadingText = 'Loading...',
    size = 'md',
    className = '',
    children,
    ...props
}) {
    const sizes = {
        sm: 'px-3.5 py-2 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={`
                inline-flex items-center justify-center gap-2 font-medium rounded-lg
                text-gray-700 bg-white border border-gray-200
                hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors duration-150
                ${sizes[size] ?? sizes.md}
                ${className}
            `}
            {...props}
        >
            {loading && (
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {loading ? loadingText : children}
        </button>
    );
}