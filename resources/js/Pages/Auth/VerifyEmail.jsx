import { Head, Link, useForm } from '@inertiajs/react';
import { PrimaryButton } from '@/Components';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const linkSent = status === 'verification-link-sent';

    return (
        <>
            <Head title="Email Verification" />

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
                            One last step before you start shopping — verify your email to secure your account.
                        </p>

                        <ul className="text-left space-y-3 mt-4">
                            {[
                                'Check your inbox for the verification email',
                                'Click the link inside to confirm your address',
                                "Didn't get it? Request a new one anytime",
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
                            <h2 className="mt-4 text-2xl font-bold text-gray-900">Verify your email</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                We sent a verification link to your inbox
                            </p>
                        </div>

                        {/* Envelope illustration */}
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
                            Thanks for signing up! Before getting started, please verify your email
                            address by clicking the link we just sent you. If you didn't receive it,
                            we'll gladly send another.
                        </p>

                        {/* Success status */}
                        {linkSent && (
                            <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                A new verification link has been sent to your email address.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <PrimaryButton
                                type="submit"
                                loading={processing}
                                loadingText="Sending..."
                                size="lg"
                                className="w-full justify-center"
                            >
                                Resend Verification Email
                            </PrimaryButton>
                        </form>

                        <div className="mt-4 flex items-center justify-center">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
                            >
                                Sign out instead
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}