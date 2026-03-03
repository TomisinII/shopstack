export default function Checkbox({ id, label, description, checked, onChange, disabled = false, className = '' }) {
    return (
        <label
            htmlFor={id}
            className={`flex items-center gap-2 cursor-pointer group ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
        >
            <div className="relative flex-shrink-0">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="
                        w-4 h-4 rounded border-gray-300 text-primary-600
                        focus:ring-2 focus:ring-primary-500 focus:ring-offset-0
                        transition-colors cursor-pointer disabled:cursor-not-allowed
                    "
                />
            </div>
            {(label || description) && (
                <div className="select-none">
                    {label && (
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {label}
                        </p>
                    )}
                    {description && (
                        <p className={`text-xs text-gray-500 ${description ? 'mt-0.5' : ''}`}>{description}</p>
                    )}
                </div>
            )}
        </label>
    );
}