'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, HelpCircle, LogIn, Download, UserCircle, Lightbulb } from 'lucide-react';
import { restartOnboarding } from '@/lib/onboarding-helpers';
import GuestModeNotice from '@/components/guest-mode-notice';
import { useData } from '@/lib/store';

export default function UserMenu() {
    const { user, signOut } = useAuth();
    const { cards } = useData();
    const router = useRouter();
    const [isExporting, setIsExporting] = useState(false);
    const isGuest = !user;

    // 动态导入导出函数
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const { exportCardsToJSON } = await import('@/lib/export-data');
            exportCardsToJSON(cards, 'my-cards.json');
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            router.refresh();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <>
            {/* Auto-trigger Notice */}
            <GuestModeNotice />

            <div className="relative z-50 group">
                {/* Header Button - 保持胶囊样式，优化 Hover 区域，高度匹配右侧按钮 (h-10) */}
                <button
                    className="relative z-20"
                >
                    <div className="flex items-center gap-3 px-4 py-2 h-10 rounded-full bg-white hover:bg-neutral-50 transition-all duration-200 border border-neutral-200 shadow-sm active:scale-90">
                        {/* Avatar */}
                        <div className="w-6 h-6 flex items-center justify-center transition-all">
                            <User className="w-4 h-4 text-neutral-500" />
                        </div>
                        {/* Label */}
                        <span className="text-sm font-medium pr-1 whitespace-nowrap text-neutral-900">
                            {isGuest ? 'Viewer' : 'Maker'}
                        </span>
                    </div>
                </button>

                {/* Dropdown - 更加简洁的菜单 */}
                <div className="absolute left-0 top-full w-56 hidden group-hover:block z-20 -mt-2 pt-2">
                    <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-neutral-100 overflow-hidden">
                        {isGuest ? (
                            /* Guest Menu - 纵向列表布局 (恢复) */
                            <>
                                <button
                                    onClick={handleExport}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Export Data
                                </button>

                                <button
                                    onClick={restartOnboarding}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <Lightbulb className="w-4 h-4" />
                                    Help & Guide
                                </button>

                                <div className="h-px bg-neutral-100 mx-4" />

                                <button
                                    onClick={() => {
                                        // 只在游客模式下清除可能残留的无效 Supabase cookies
                                        if (isGuest && user === null) {
                                            const cookies = document.cookie.split(';');
                                            for (let cookie of cookies) {
                                                const [name] = cookie.split('=');
                                                const trimmedName = name.trim();
                                                if (trimmedName.startsWith('sb-')) {
                                                    document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                                                }
                                            }
                                        }

                                        // 跳转到登录页
                                        window.location.href = '/login';
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors cursor-pointer"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Sign In / Sign Up
                                </button>
                            </>
                        ) : (
                            /* Logged In Menu */
                            <>
                                <div className="px-4 py-3 border-b border-neutral-50">
                                    <p className="text-sm font-semibold text-neutral-900 truncate">{user.email}</p>
                                </div>

                                <button
                                    onClick={handleExport}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Export Data
                                </button>

                                <button
                                    onClick={restartOnboarding}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                    Help & Guide
                                </button>

                                <div className="h-px bg-neutral-100 mx-4" />

                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
