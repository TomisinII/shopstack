export default function DangerButton({
    type = 'button',
    disabled = false,
    loading = false,
    loadingText = 'Loading...',
    filled = false,
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

    const variants = filled
        ? 'text-white bg-red-600 border border-red-600 hover:bg-red-700 hover:border-red-700 active:bg-red-800'
        : 'text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 active:bg-red-100';

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={`
                inline-flex items-center justify-center gap-2 font-medium rounded-lg
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors duration-150
                ${variants}
                ${sizes[size] ?? sizes.md}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <>
                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {loadingText}
                </>
            ) : children}
        </button>
    );
}