'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import MagicalEditor from './magical-editor';

export default function HeroSection() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Column: Typography */}
                <div className="flex flex-col lg:col-span-7">
                    {/* Eyebrow */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <p className="text-sm font-semibold tracking-widest uppercase text-gray-500">
                            PROMPT ENGINEERING OS
                        </p>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-black leading-normal text-gray-900 mb-12"
                    >
                        Don't just paste.
                        <br />
                        Structure it.
                    </motion.h1>

                    {/* Description Group */}
                    <div className="space-y-4 mb-10">
                        {/* Sub-headline */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-2xl font-medium text-gray-600"
                        >
                            Ctrl+P — Prompt Manager
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-lg text-gray-400 leading-relaxed max-w-md text-balance"
                        >
                            Your personal collection of AI prompts.
                            <br />
                            Organize, save, and reuse your ideas as code.
                        </motion.p>
                    </div>

                    {/* CTA Button */}
                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex items-center gap-4"
                    >
                        <Link href="/dashboard">
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-gray-900 text-white px-8 py-4 rounded-full text-base font-semibold flex items-center gap-2 shadow-lg transition-transform"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </Link>

                        <Link href="/story">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-transparent border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 px-8 py-4 rounded-full text-base font-semibold transition-colors"
                            >
                                The Story
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>

                {/* Right Column: Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="flex items-center justify-center relative lg:col-span-5"
                >
                    {/* Spotlight Glow */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.4, 0.5, 0.4]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(250,204,21,0.2)_0%,transparent_70%)] rounded-full blur-3xl"
                        />
                    </div>

                    {/* Animation Container */}
                    <div className="relative z-10 w-full max-w-lg">
                        <MagicalEditor />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
