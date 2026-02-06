'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: 'max-w-lg' | 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl' | 'max-w-5xl';
    hideHeader?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', hideHeader = false }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            // 计算滚动条宽度
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
            // 添加 padding 来补偿滚动条宽度，防止页面跳动
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                ref={overlayRef}
                className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                {!hideHeader && (
                    <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                        <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
