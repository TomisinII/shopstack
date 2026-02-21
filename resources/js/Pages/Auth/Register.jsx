import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { InputLabel, TextInput, PrimaryButton } from '@/Components';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

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
                    <div className="relative text-center text-white max-w-sm">
                        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">ShopStack</h1>
                        <p className="text-lg text-white/80 leading-relaxed">
                            Join thousands of shoppers. Create your account to start shopping, track orders, and more.
                        </p>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
                    <div className="w-full max-w-sm">

                        {/* Logo + heading */}
                        <div className="text-center mb-8">
                            <p className="text-2xl font-extrabold tracking-tight">
                                <span className="text-primary-600">Shop</span>
                                <span className="text-gray-900">Stack</span>
                            </p>
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">Create an account</h2>
                            <p className="mt-1 text-sm text-gray-500">Start your shopping journey today</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">

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
                                <div className="relative mt-1.5">
                                    <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        onChange={(e) => setData('password', e.target.value)}
                                        error={errors.password}
                                        className="pl-10 pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div>
                                <InputLabel htmlFor="password_confirmation">Confirm Password</InputLabel>
                                <div className="relative mt-1.5">
                                    <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </span>
                                    <TextInput
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        error={errors.password_confirmation}
                                        className="pl-10 pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                        className="absolute inset-y-0 right-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
                                    >
                                        {showConfirm ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <PrimaryButton
                                type="submit"
                                loading={processing}
                                loadingText="Creating account..."
                                size="lg"
                                className="w-full justify-center"
                            >
                                Create Account
                            </PrimaryButton>
                        </form>

                        {/* Login link */}
                        <p className="mt-6 text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link
                                href={route('login')}
                                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}