'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthLayout from '@/components/auth/auth-layout';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            setLoading(false);
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('密码至少需要6个字符');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || '注册失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout title="Check your email" showSocial={false}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-gray-500">Create an account to save your prompts to the cloud. It&apos;s free.</p>
                    <p className="text-neutral-600 mb-6 text-sm leading-relaxed">
                        We&apos;ve sent a verification link to <br /><strong className="text-neutral-900">{email}</strong>.
                        <br />Please check your inbox to complete the process.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-medium hover:bg-black transition-all shadow-sm hover:shadow-md text-sm"
                    >
                        Sign in
                    </Link>
                </motion.div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-xs text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSignup} className="flex flex-col gap-3">
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-transparent rounded-lg focus:bg-white focus:border-neutral-300 focus:ring-0 outline-none transition-all placeholder:text-neutral-400 text-sm"
                    placeholder="name@work-email.com"
                />

                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-neutral-50 border border-transparent rounded-lg focus:bg-white focus:border-neutral-300 focus:ring-0 outline-none transition-all placeholder:text-neutral-400 text-sm"
                    placeholder="Password (min 6 chars)"
                />

                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-transparent rounded-lg focus:bg-white focus:border-neutral-300 focus:ring-0 outline-none transition-all placeholder:text-neutral-400 text-sm"
                    placeholder="Confirm Password"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-[#1a1a1a] text-white py-3 rounded-lg font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
                >
                    {loading ? 'Creating account...' : 'Create account'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="text-neutral-500 hover:text-neutral-900 text-sm transition-colors"
                >
                    Already have an account? <span className="font-medium underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900">Sign in</span>
                </Link>
            </div>
        </AuthLayout>
    );
}
