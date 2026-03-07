import { Head } from '@inertiajs/react';

export default function Maintenance() {
    return (
        <>
            <Head title="Under Maintenance — ShopStack" />

            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">

                {/* Ambient background blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative text-center max-w-lg w-full">

                    {/* Animated icon */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="relative w-24 h-24">
                            {/* Outer ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-primary-500/30 animate-ping" />
                            <div className="absolute inset-0 rounded-full border border-primary-500/50" />
                            {/* Inner */}
                            <div className="absolute inset-3 rounded-full bg-primary-600/20 backdrop-blur-sm flex items-center justify-center border border-primary-500/40">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Store name */}
                    <p className="text-primary-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">
                        ShopStack
                    </p>

                    {/* Heading */}
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                        We're Under<br />
                        <span className="text-primary-400">Maintenance</span>
                    </h1>

                    {/* Message */}
                    <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-sm mx-auto">
                        We're making some improvements to give you a better shopping experience. Please check back soon.
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className="flex-1 h-px bg-gray-800" />
                        <span className="text-gray-600 text-xs uppercase tracking-widest">In the meantime</span>
                        <div className="flex-1 h-px bg-gray-800" />
                    </div>

                    {/* Info pills */}
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        {[
                            { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'support@shopstack.com' },
                            { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Back shortly' },
                        ].map(({ icon, label }) => (
                            <div key={label} className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                </svg>
                                <span className="text-gray-400 text-xs">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Admin back door — subtle */}
                    <div className="mt-14">
                        <a href="/admin/dashboard"
                            className="text-gray-700 text-xs hover:text-gray-500 transition-colors">
                            Admin access →
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}