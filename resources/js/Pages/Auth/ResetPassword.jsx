import { Head, Link, useForm } from '@inertiajs/react';
import { InputLabel, TextInput, PrimaryButton, PasswordInput } from '@/Components';


export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset Password" />

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
                            Choose a strong new password to secure your account.
                        </p>

                        <ul className="text-left space-y-3 mt-4">
                            {[
                                'At least 8 characters long',
                                'Mix of letters, numbers & symbols',
                                'Never share your password with anyone',
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
                    <div className="w-full max-w-lg">

                        {/* Logo + heading */}
                        <div className="text-center mb-8">
                            <p className="text-2xl font-extrabold tracking-tight">
                                <span className="text-primary-600">Shop</span>
                                <span className="text-gray-900">Stack</span>
                            </p>
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">Set a new password</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Almost there — just pick a new password below
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">

                            {/* Email (read-only context, still submitted) */}
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
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                        className="pl-10 bg-gray-50 text-gray-500 cursor-default"
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* New password */}
                            <div>
                                <InputLabel htmlFor="password" required>New Password</InputLabel>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="new-password"
                                    autoFocus
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                />
                            </div>

                            {/* Confirm password */}
                            <div>
                                <InputLabel htmlFor="password_confirmation" required>Confirm New Password</InputLabel>
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
                                loadingText="Resetting password..."
                                size="lg"
                                className="w-full justify-center"
                            >
                                Reset Password
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