'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Animation Configuration
const TIMING = {
    CAPTURE: 2500,
    SCAN: 1500,
    RESULT: 1500,
    PAUSE: 500
};

type Step = 'CAPTURE' | 'SCAN' | 'RESULT';

export default function MagicalEditor() {
    const [step, setStep] = useState<Step>('CAPTURE');

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const runSequence = async () => {
            while (true) {
                setStep('CAPTURE');
                await new Promise(r => setTimeout(r, TIMING.CAPTURE));

                setStep('SCAN');
                await new Promise(r => setTimeout(r, TIMING.SCAN));

                setStep('RESULT');
                await new Promise(r => setTimeout(r, TIMING.RESULT));

                // Small pause before looping
                await new Promise(r => setTimeout(r, TIMING.PAUSE));
            }
        };

        runSequence();

        return () => {
            // Cleanup logic if needed
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-xl">
            {/* Editor Window Container */}
            <motion.div
                className="relative w-full aspect-square md:aspect-[4/3] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Window Header */}
                <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    <div className="ml-auto text-xs text-gray-300 font-mono">copywriting_assistant.md</div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative p-6 font-mono text-sm md:text-base leading-relaxed overflow-hidden bg-white">


                    <div className="relative z-10 h-full">
                        <AnimatePresence mode="wait">
                            {step === 'CAPTURE' && (
                                <motion.div
                                    key="capture"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.4 }}
                                    className="text-gray-400 space-y-1"
                                >
                                    <div>create a persona for a lifestyle creator</div>
                                    <div className="relative inline-block w-full">
                                        <motion.div
                                            className="absolute inset-0 bg-blue-50 -mx-2 px-2 rounded"
                                            initial={{ scaleX: 0, opacity: 0 }}
                                            animate={{ scaleX: 1, opacity: 1 }}
                                            transition={{ delay: 0.8, duration: 0.4 }}
                                        />
                                        <motion.span
                                            className="relative z-10"
                                            initial={{ color: "#9CA3AF", fontWeight: 400 }}
                                            animate={{ color: "#4B5563", fontWeight: 600 }}
                                            transition={{ delay: 0.8, duration: 0.4 }}
                                        >
                                            niche is minimalism, coffee and slow living
                                        </motion.span>
                                    </div>
                                    <div>tone should be chill, poetic and aesthetic</div>
                                    <div>focus on visual storytelling and mood</div>
                                    <div>audience is creative professionals</div>
                                    <div>strict rule: keep it concise and high-end</div>
                                </motion.div>
                            )}

                            {step === 'SCAN' && (
                                <motion.div
                                    key="scan"
                                    className="absolute inset-0"
                                >
                                    {/* Ghost of text being scanned */}
                                    <div className="text-gray-200 space-y-1 opacity-50 blur-[1px]">
                                        <div>create a persona for a lifestyle creator</div>
                                        <div>niche is minimalism, coffee and slow living</div>
                                        <div>tone should be chill, poetic and aesthetic</div>
                                        <div>focus on visual storytelling and mood</div>
                                        <div>audience is creative professionals</div>
                                        <div>strict rule: keep it concise and high-end</div>
                                    </div>

                                    {/* Laser Scanner */}
                                    <motion.div
                                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(96,165,250,0.8)]"
                                        initial={{ top: -10, opacity: 0 }}
                                        animate={{ top: '120%', opacity: 1 }}
                                        transition={{ duration: 1.5, ease: "linear" }}
                                    />

                                    {/* Scanning Overlay Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-b from-blue-50/10 to-transparent"
                                        initial={{ height: 0 }}
                                        animate={{ height: '100%' }}
                                        transition={{ duration: 1.5, ease: "linear" }}
                                    />
                                </motion.div>
                            )}

                            {step === 'RESULT' && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="h-full"
                                >
                                    <div className="space-y-4 text-gray-800">
                                        <div className="space-y-1">
                                            <div className="text-gray-500 font-bold text-lg"># Role: The Slow Living Creator</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-gray-500 font-semibold text-sm uppercase tracking-wide">## Profile</div>
                                            <div className="pl-3 border-l-2 border-gray-100 text-sm space-y-1">
                                                <div><span className="font-medium text-gray-600">• Niche:</span> <span className="text-gray-600">Minimalism & Coffee</span></div>
                                                <div><span className="font-medium text-gray-600">• Target:</span> <span className="text-gray-600">Creative Professionals</span></div>
                                                <div><span className="font-medium text-gray-600">• Focus:</span> <span className="text-gray-600">Visual Storytelling</span></div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-gray-500 font-semibold text-sm uppercase tracking-wide">## Rules</div>
                                            <div className="pl-3 border-l-2 border-gray-100 text-gray-500 text-xs md:text-sm space-y-1">
                                                <div>1. Use Poetic & Chill language.</div>
                                                <div>2. Maintain High-end Aesthetic.</div>
                                                <div>3. Keep output Concise.</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Success Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-full font-medium"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Structured
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
