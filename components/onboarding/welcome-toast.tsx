'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function WelcomeToast() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 检查是否是首次访问
        const hasVisited = localStorage.getItem('has_visited');

        if (!hasVisited) {
            setIsVisible(true);
            localStorage.setItem('has_visited', 'true');

            // 3 秒后自动消失
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
            >
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200 max-w-md">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-1">
                                欢迎使用 CTRL+P 🎉
                            </h3>
                            <p className="text-sm text-neutral-600">
                                我们为你准备了一些示例卡片，开始探索吧！
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
