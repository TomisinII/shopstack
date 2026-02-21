export default function Toggle({ id, label, description, checked, onChange, disabled = false, className = '' }) {
    return (
        <label
            htmlFor={id}
            className={`flex items-start gap-3 cursor-pointer group ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
        >
            {/* Track + thumb */}
            <div className="relative flex-shrink-0 mt-0.5">
                <input
                    type="checkbox"
                    id={id}
                    className="sr-only peer"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                />
                <div
                    className="
                        w-9 h-5 rounded-full transition-colors duration-200
                        bg-gray-200 peer-checked:bg-primary-600
                        peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-1
                        after:absolute after:top-0.5 after:left-0.5
                        after:bg-white after:rounded-full
                        after:w-4 after:h-4 after:shadow-sm
                        after:transition-transform after:duration-200
                        peer-checked:after:translate-x-4
                    "
                />
            </div>

            {/* Label / description */}
            {(label || description) && (
                <div className="select-none">
                    {label && (
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {label}
                        </p>
                    )}
                    {description && (
                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    )}
                </div>
            )}
        </label>
    );
}