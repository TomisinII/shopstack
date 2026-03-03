import { Head, Link, useForm } from '@inertiajs/react';
import { InputLabel, TextInput, PrimaryButton } from '@/Components';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />

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
                    <div className="relative text-center text-white max-w-lg space-y-6">
                        <h1 className="text-4xl font-extrabold tracking-tight">ShopStack</h1>
                        <p className="text-lg text-white/80 leading-relaxed">
                            No worries — it happens to the best of us. We'll get you back in.
                        </p>

                        <ul className="text-left space-y-3 mt-4">
                            {[
                                'Check your inbox for the reset link',
                                'Link expires after 60 minutes',
                                'Your account stays secure',
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
                <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
                    <div className="w-full max-w-sm">

                        {/* Logo + heading */}
                        <div className="text-center mb-8">
                            <p className="text-2xl font-extrabold tracking-tight">
                                <span className="text-primary-600">Shop</span>
                                <span className="text-gray-900">Stack</span>
                            </p>
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">Forgot your password?</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Enter your email and we'll send you a reset link
                            </p>
                        </div>

                        {/* Success status */}
                        {status && (
                            <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="email">Email Address</InputLabel>
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
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="john@example.com"
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <PrimaryButton
                                type="submit"
                                loading={processing}
                                loadingText="Sending link..."
                                size="lg"
                                className="w-full justify-center"
                            >
                                Send Reset Link
                            </PrimaryButton>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            Remember your password?{' '}
                            <Link
                                href={route('login')}
                                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Back to sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}