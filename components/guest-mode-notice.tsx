'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/lib/store';
import Link from 'next/link';
import { Info, LogIn } from 'lucide-react';
import Modal from '@/components/ui/modal';

interface GuestModeNoticeProps {
    // 移除了外部控制属性，因为不再需要手动触发
}

export default function GuestModeNotice() {
    const { isGuest } = useData();
    const [isOpen, setIsOpen] = useState(false);

    // 自动检测首次进入
    useEffect(() => {
        const dismissed = localStorage.getItem('guest_notice_dismissed');
        // 只有在是游客且没有关闭过提示的情况下才显示
        if (isGuest && dismissed !== 'true') {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isGuest]);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleDismissForever = () => {
        localStorage.setItem('guest_notice_dismissed', 'true');
        setIsOpen(false);
    };

    // 只在游客模式时可见
    if (!isGuest) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Viewer Mode" hideHeader={true} maxWidth="max-w-[480px]">
            <div className="relative flex flex-col pt-6 pb-6 w-full bg-white rounded-xl font-sans text-center">
                {/* Minimal Header */}
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center">
                        <Info className="w-6 h-6 text-neutral-900" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-serif text-neutral-900">Viewer Mode</h2>
                </div>

                {/* Content */}
                <ul className="px-10 space-y-4 mb-8 text-left list-disc list-outside ml-4 marker:text-neutral-400">
                    <li className="text-base text-neutral-600 leading-relaxed pl-1">
                        You&apos;re currently in <span className="font-bold underline decoration-yellow-400/50">Viewer Mode</span>.
                        Your prompts are saved to your browser&apos;s local storage.
                    </li>
                    <li className="text-base text-neutral-600 leading-relaxed pl-1">
                        Clearing your cache will <span className="font-medium text-neutral-900 border-b border-neutral-200">permanently delete your data</span>.
                    </li>
                    <li className="text-base text-neutral-600 leading-relaxed pl-1">
                        For cross-device access and backup, please <span className="font-medium text-neutral-900">create an account</span>.
                    </li>
                </ul>

                {/* Actions */}
                <div className="flex flex-col gap-3 px-6">
                    <button
                        onClick={handleClose}
                        className="w-full h-11 bg-[#1a1a1a] text-white rounded-lg font-semibold hover:bg-black transition-all shadow-sm text-base"
                    >
                        I understand
                    </button>
                    <button
                        onClick={handleDismissForever}
                        className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        Don&apos;t show this again
                    </button>
                </div>
            </div>
        </Modal>
    );
}
