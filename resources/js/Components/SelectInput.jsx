export default function SelectInput({
    error,
    options = [],
    groups = [],
    placeholder = 'Select an option',
    className = '',
    ...props
}) {
    return (
        <div>
            <select
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-all bg-white
                    ${error
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    } ${className}`}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}

                {/* Flat options */}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}

                {/* Grouped options */}
                {groups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                        {group.options.map((opt) => (
                            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                {opt.label}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>

            {error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}