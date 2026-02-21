export default function Avatar({ name, src }) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
        );
    }

    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const colors = [
        'bg-violet-100 text-violet-700',
        'bg-blue-100 text-blue-700',
        'bg-emerald-100 text-emerald-700',
        'bg-amber-100 text-amber-700',
        'bg-rose-100 text-rose-700',
        'bg-indigo-100 text-indigo-700',
    ];
    const color = colors[name.charCodeAt(0) % colors.length];

    return (
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-white shadow-sm ${color}`}>
            {initials}
        </div>
    );
}