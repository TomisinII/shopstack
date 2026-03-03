import { Head, Link, useForm } from '@inertiajs/react';
import { InputLabel, TextInput, PrimaryButton, PasswordInput } from '@/Components';

const ROLES = [
    {
        value: 'Customer',
        label: 'Customer',
        hint: 'Browse and purchase products',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        value: 'Vendor',
        label: 'Vendor',
        hint: 'Sell products on ShopStack',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
];

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'Customer',
        store_name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const isVendor = data.role === 'Vendor';

    return (
        <>
            <Head title="Create Account" />

            <div className="flex min-h-screen">
                {/* ── Left panel ── */}
                <div
                    className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-12"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 60%, #8b5cf6 100%)' }}
                >
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{ background: 'radial-gradient(circle at 30% 70%, #a78bfa 0%, transparent 60%)' }}
                    />
                    <div className="relative text-center text-white max-w-sm space-y-6">
                        <h1 className="text-4xl font-extrabold tracking-tight">ShopStack</h1>
                        <p className="text-lg text-white/80 leading-relaxed">
                            Join thousands of shoppers and sellers. Create your account to get started.
                        </p>

                        {/* Feature bullets */}
                        <ul className="text-left space-y-3 mt-4">
                            {[
                                'Free to join — no hidden fees',
                                'Sell or shop in minutes',
                                'Secure payments via Stripe & Paystack',
                                'Real-time order tracking',
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-violet-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 overflow-y-auto">
                    <div className="w-full max-w-lg">

                        {/* Logo + heading */}
                        <div className="text-center mb-8">
                            <p className="text-2xl font-extrabold tracking-tight">
                                <span className="text-primary-600">Shop</span>
                                <span className="text-gray-900">Stack</span>
                            </p>
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">Create an account</h2>
                            <p className="mt-1 text-sm text-gray-500">Start your journey today</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">

                            {/* Role selector */}
                            <div>
                                <InputLabel>I want to</InputLabel>
                                <div className="grid grid-cols-2 gap-3 mt-1.5">
                                    {ROLES.map((role) => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setData('role', role.value)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                                                data.role === role.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className={data.role === role.value ? 'text-primary-600' : 'text-gray-400'}>
                                                {role.icon}
                                            </span>
                                            <span>{role.label}</span>
                                            <span className={`text-xs font-normal ${data.role === role.value ? 'text-primary-500' : 'text-gray-400'}`}>
                                                {role.hint}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {errors.role && <p className="mt-1.5 text-xs text-red-500">{errors.role}</p>}
                            </div>

                            {/* Vendor notice */}
                            {isVendor && (
                                <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Vendor accounts require admin approval before your store goes live. You'll be notified by email.
                                    </p>
                                </div>
                            )}

                            {/* Full name */}
                            <div>
                                <InputLabel htmlFor="name">Full Name</InputLabel>
                                <div className="relative mt-1.5">
                                    <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        autoComplete="name"
                                        autoFocus
                                        placeholder="John Doe"
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Store name — vendor only */}
                            {isVendor && (
                                <div>
                                    <InputLabel htmlFor="store_name" required>Store Name</InputLabel>
                                    <div className="relative mt-1.5">
                                        <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </span>
                                        <TextInput
                                            id="store_name"
                                            type="text"
                                            name="store_name"
                                            value={data.store_name}
                                            placeholder="e.g. Adaugo's Boutique"
                                            onChange={(e) => setData('store_name', e.target.value)}
                                            error={errors.store_name}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <InputLabel htmlFor="email">Email</InputLabel>
                                <div className="relative mt-1.5">
                                    <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        autoComplete="username"
                                        placeholder="john@example.com"
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <InputLabel htmlFor="password">Password</InputLabel>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                />
                            </div>

                            {/* Confirm password */}
                            <div>
                                <InputLabel htmlFor="password_confirmation">Confirm Password</InputLabel>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={errors.password_confirmation}
                                />
                            </div>

                            <PrimaryButton
                                type="submit"
                                loading={processing}
                                loadingText={isVendor ? 'Creating store...' : 'Creating account...'}
                                size="lg"
                                className="w-full justify-center"
                            >
                                {isVendor ? 'Create Vendor Account' : 'Create Account'}
                            </PrimaryButton>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link href={route('login')} className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}