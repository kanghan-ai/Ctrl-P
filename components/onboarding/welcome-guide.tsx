'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { guideSteps, GuideStep } from '@/lib/onboarding-content';

export default function WelcomeGuide() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const step = guideSteps[currentStep];

    useEffect(() => {
        // 检查是否已完成引导
        const hasCompleted = localStorage.getItem('onboarding_completed');
        if (!hasCompleted) {
            setIsVisible(true);
        }
    }, []);

    const handleComplete = () => {
        localStorage.setItem('onboarding_completed', 'true');
        setIsVisible(false);
    };

    const handleNext = () => {
        if (currentStep < guideSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (!isVisible) return null;

    const isLastStep = currentStep === guideSteps.length - 1;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleSkip}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
                        aria-label="关闭引导"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>

                    {/* Content */}
                    <div className="p-12 pt-16">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {guideSteps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep
                                        ? 'w-8 bg-black'
                                        : idx < currentStep
                                            ? 'w-1.5 bg-neutral-400'
                                            : 'w-1.5 bg-neutral-200'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                {/* Icon */}
                                <div className="text-6xl mb-6">
                                    {step.icon}
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                                    {step.title}
                                </h2>

                                {/* Description */}
                                <p className="text-neutral-600 mb-6 text-base">
                                    {step.description}
                                </p>

                                {/* Media (GIF/Video) */}
                                {step.media && (
                                    <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-50">
                                        {step.media.type === 'gif' || step.media.type === 'image' ? (
                                            <img
                                                src={step.media.src}
                                                alt={step.media.alt}
                                                className="w-full h-auto"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <video
                                                src={step.media.src}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-auto"
                                            >
                                                您的浏览器不支持视频播放
                                            </video>
                                        )}
                                    </div>
                                )}

                                {/* Details */}
                                {step.details && step.details.length > 0 && (
                                    <div className="bg-neutral-50 rounded-xl p-6 mb-4 text-left max-w-md mx-auto">
                                        <ul className="space-y-2.5">
                                            {step.details.map((detail, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-sm text-neutral-700 leading-relaxed"
                                                >
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Tip */}
                                {step.tip && (
                                    <p className="text-xs text-neutral-500 italic mt-4">
                                        💡 {step.tip}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between px-12 py-6 bg-neutral-50 border-t border-neutral-100">
                        {/* Left: Skip or Back */}
                        {currentStep === 0 ? (
                            <button
                                onClick={handleSkip}
                                className="text-neutral-500 hover:text-neutral-700 transition-colors text-sm font-medium"
                            >
                                跳过引导
                            </button>
                        ) : (
                            <button
                                onClick={handlePrev}
                                className="flex items-center gap-2 text-neutral-700 hover:text-black transition-colors text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                上一步
                            </button>
                        )}

                        {/* Right: Next or Finish */}
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full hover:bg-neutral-800 transition-colors font-medium text-sm"
                        >
                            {isLastStep ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    开始使用
                                </>
                            ) : (
                                <>
                                    下一步
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// 重启引导的辅助函数
export const restartGuide = () => {
    localStorage.removeItem('onboarding_completed');
    window.location.reload();
};
