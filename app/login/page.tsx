'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthLayout from '@/components/auth/auth-layout';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!url || !key) {
                throw new Error('Supabase 配置缺失');
            }

            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                let userMessage = '';
                if (authError.message.includes('Invalid login credentials')) {
                    userMessage = '❌ 邮箱或密码错误';
                } else if (authError.message.includes('Email not confirmed')) {
                    userMessage = '📧 您的邮箱尚未验证';
                } else {
                    userMessage = `❌ 登录失败：${authError.message}`;
                }

                throw new Error(userMessage);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message || '登录失败，请检查邮箱和密码');
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-xs text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-neutral-50 border border-transparent rounded-lg focus:bg-white focus:border-neutral-300 focus:ring-0 outline-none transition-all placeholder:text-neutral-400 text-sm"
                    placeholder="name@work-email.com"
                />

                <input
                    id="password"
                    type="password"
                    value={email ? password : ''} // Visual trick: hide password dots if email empty (optional, but keeps it clean) -> actually better to just show it
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-neutral-50 border border-transparent rounded-lg focus:bg-white focus:border-neutral-300 focus:ring-0 outline-none transition-all placeholder:text-neutral-400 text-sm"
                    placeholder="Password"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-[#1a1a1a] text-white py-3 rounded-lg font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href="/signup"
                    className="text-neutral-500 hover:text-neutral-900 text-sm transition-colors"
                >
                    No account? <span className="font-medium underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900">Create one</span>
                </Link>
            </div>
        </AuthLayout>
    );
}

