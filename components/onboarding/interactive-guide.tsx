'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';
import Spotlight from './spotlight';
import { interactiveSteps, InteractiveStep } from '@/lib/onboarding-content';

interface InteractiveGuideProps {
    onComplete?: () => void;
}

export default function InteractiveGuide({ onComplete }: InteractiveGuideProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [waitingForAction, setWaitingForAction] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState('');

    const currentStep = interactiveSteps[currentStepIndex];

    useEffect(() => {
        // 检查是否已完成引导
        const hasCompleted = localStorage.getItem('onboarding_completed');
        if (!hasCompleted) {
            setIsVisible(true);
        }
    }, []);

    useEffect(() => {
        if (!currentStep || !isVisible) return;

        // 设置等待状态
        if (currentStep.waitFor && currentStep.waitFor !== 'none') {
            setWaitingForAction(true);
        } else {
            setWaitingForAction(false);
        }

        // 监听用户操作
        const setupListeners = () => {
            switch (currentStep.waitFor) {
                case 'paste':
                    const handlePaste = () => {
                        showCelebration('太棒了！✨');
                        nextStep();
                    };
                    window.addEventListener('paste', handlePaste);
                    return () => window.removeEventListener('paste', handlePaste);

                case 'click':
                    if (currentStep.targetSelector) {
                        const element = document.querySelector(currentStep.targetSelector);
                        const handleClick = () => {
                            showCelebration('干得好！👍');
                            setTimeout(nextStep, 800);
                        };
                        element?.addEventListener('click', handleClick);
                        return () => element?.removeEventListener('click', handleClick);
                    }
                    break;

                case 'drag':
                    const handleDragStart = () => {
                        showCelebration('很好！🎨');
                        setTimeout(nextStep, 800);
                        window.removeEventListener('dragstart', handleDragStart);
                    };
                    window.addEventListener('dragstart', handleDragStart);
                    return () => window.removeEventListener('dragstart', handleDragStart);
            }
        };

        const cleanup = setupListeners();
        return cleanup;
    }, [currentStepIndex, isVisible]);

    const showCelebration = (message: string) => {
        setCelebrationMessage(message);
        setTimeout(() => setCelebrationMessage(''), 2000);
    };

    const nextStep = () => {
        if (currentStepIndex < interactiveSteps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            setWaitingForAction(false);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('onboarding_completed', 'true');
        setIsVisible(false);
        onComplete?.();
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {/* Celebration Message */}
            <AnimatePresence>
                {celebrationMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-medium"
                    >
                        {celebrationMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Guide */}
            <Spotlight targetSelector={currentStep.targetSelector || null}>
                {/* Close Button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-3 right-3 p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-neutral-500" />
                </button>

                {/* Content */}
                <div className="pr-8">
                    {/* Step indicator */}
                    <div className="flex items-center gap-1.5 mb-4">
                        {interactiveSteps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all ${idx === currentStepIndex
                                        ? 'w-6 bg-black'
                                        : idx < currentStepIndex
                                            ? 'w-1.5 bg-green-500'
                                            : 'w-1.5 bg-neutral-200'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">
                        {currentStep.title}
                    </h3>

                    {/* Description */}
                    <p className="text-neutral-600 text-sm mb-3">
                        {currentStep.description}
                    </p>

                    {/* Action Hint */}
                    {currentStep.actionHint && (
                        <p className="text-xs text-neutral-500 italic mb-4">
                            💡 {currentStep.actionHint}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                        {currentStepIndex > 0 && currentStep.type !== 'complete' && (
                            <button
                                onClick={handleSkip}
                                className="text-xs text-neutral-400 hover:text-neutral-600"
                            >
                                跳过引导
                            </button>
                        )}

                        {!waitingForAction && (
                            <button
                                onClick={currentStep.type === 'complete' ? handleComplete : nextStep}
                                className="ml-auto flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
                            >
                                {currentStep.type === 'complete' ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        开始使用
                                    </>
                                ) : (
                                    <>
                                        下一步
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}

                        {waitingForAction && (
                            <div className="ml-auto flex items-center gap-2 text-neutral-500 text-sm">
                                <div className="w-4 h-4 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
                                等待操作...
                            </div>
                        )}
                    </div>
                </div>
            </Spotlight>
        </AnimatePresence>
    );
}

// 重启引导的辅助函数
export const restartGuide = () => {
    localStorage.removeItem('onboarding_completed');
    window.location.reload();
};
