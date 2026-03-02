'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, LayoutGrid, Move, Edit, Lock, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { hintBarTips } from '@/lib/onboarding-content';

export default function HintBar() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const iconMap: Record<string, any> = {
        Lightbulb,
        LayoutGrid,
        Move,
        Edit,
        Lock,
        HelpCircle
    };

    useEffect(() => {
        // 检查是否已关闭提示条
        const dismissed = localStorage.getItem('hint_bar_dismissed');

        // 只要没有主动关闭过,就显示提示栏
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    // 监听重启引导事件
    useEffect(() => {
        const handleRestart = () => {
            setIsVisible(true);
            setCurrentIndex(0); // 重置到第一条
            setIsPaused(false); // 重置暂停状态
        };

        window.addEventListener('restart-onboarding', handleRestart);
        return () => window.removeEventListener('restart-onboarding', handleRestart);
    }, []);

    // 自动轮播
    useEffect(() => {
        if (!isVisible || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % hintBarTips.length);
        }, 5000); // 每5秒切换一次

        return () => clearInterval(interval);
    }, [isVisible, isPaused]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('hint_bar_dismissed', 'true');
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + hintBarTips.length) % hintBarTips.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % hintBarTips.length);
    };

    if (!isVisible) return null;

    const currentTip = hintBarTips[currentIndex];
    const IconComponent = iconMap[currentTip.icon];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 min-h-[48px]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="max-w-7xl mx-auto px-4 h-[48px] flex items-center justify-between gap-4">
                    {/* 左侧：箭头按钮 */}
                    <button
                        onClick={handlePrevious}
                        className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                        aria-label="上一条"
                    >
                        <ChevronLeft className="w-4 h-4 text-blue-600" />
                    </button>

                    {/* 中间：内容区域 - 固定高度容器 */}
                    <div className="flex-1 flex items-center gap-3 min-w-0 h-full">
                        {IconComponent && <IconComponent className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={2} />}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-sm text-blue-900 flex items-center gap-1 overflow-hidden">
                                    <span className="font-medium">{currentTip.title}：</span>
                                    {currentTip.kbd && currentTip.content.includes('{kbd}') ? (
                                        // 如果有{kbd}占位符,将其替换为样式化的快捷键
                                        <>
                                            {currentTip.content.split('{kbd}').map((part, index, arr) => (
                                                <span key={index} className={index === 0 ? 'truncate' : ''}>
                                                    {part}
                                                    {index < arr.length - 1 && (
                                                        <kbd className="px-2 py-1 bg-white rounded border border-blue-200 text-xs font-mono flex-shrink-0 inline-block mx-1">
                                                            {currentTip.kbd}
                                                        </kbd>
                                                    )}
                                                </span>
                                            ))}
                                        </>
                                    ) : (
                                        // 没有占位符,直接显示内容
                                        <span className="truncate">{currentTip.content}</span>
                                    )}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* 右侧：导航点和关闭按钮 */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* 右侧箭头 */}
                        <button
                            onClick={handleNext}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            aria-label="下一条"
                        >
                            <ChevronRight className="w-4 h-4 text-blue-600" />
                        </button>

                        {/* 导航点 */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            {hintBarTips.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-blue-600 w-4'
                                        : 'bg-blue-300 hover:bg-blue-400'
                                        }`}
                                    aria-label={`跳转到提示 ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* 关闭按钮 */}
                        <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            aria-label="关闭提示"
                        >
                            <X className="w-4 h-4 text-blue-600" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
