export default function InputLabel({ htmlFor, children, required = false, className = '' }) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-gray-700 mb-1.5 ${className}`}
        >
            {children}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
    );
}