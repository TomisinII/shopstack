const STATUS_STYLES = {
    // Product
    published:  'bg-green-50 text-green-700 ring-1 ring-green-600/20',
    draft:      'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
    archived:   'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20',

    // Order
    pending:    'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
    processing: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    shipped:    'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
    delivered:  'bg-green-50 text-green-700 ring-1 ring-green-600/20',
    cancelled:  'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    refunded:   'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20',

    // Payment
    paid:       'bg-green-50 text-green-700 ring-1 ring-green-600/20',
    failed:     'bg-red-50 text-red-700 ring-1 ring-red-600/20',

    // Vendor profile
    approved:   'bg-green-50 text-green-700 ring-1 ring-green-600/20',
    suspended:  'bg-red-50 text-red-700 ring-1 ring-red-600/20',

    // Category
    active:     'bg-green-50 text-green-700 ring-1 ring-green-600/20',
    draft:      'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
};

export default function StatusBadge({ status, className = '' }) {
    const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style} ${className}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
}