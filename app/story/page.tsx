'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Database, Code2, Layers, Keyboard, User, ArrowLeft, FileText, StickyNote, LayoutTemplate, BookOpen, Copy, Clipboard, Image as ImageIcon, QrCode } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// --- Data ---
const sections = [
    {
        id: 'conflict',
        theme: 'bg-white',
        text: {
            step: '01 — The Conflict',
            headline: 'The Clipboard\nis not a Database.',
            annotation: '// 剪贴板不是数据库。',
            bodyEn: 'We live in the era of AI, yet we manage our most powerful tools—prompts—like sticky notes. We copy from everywhere, paste into messy docs, and lose the context forever.',
            bodyCn: '我们生活在 AI 时代，却仍然像对待便签纸一样管理着自己最强大的工具——提示词。我们到处复制、随手粘贴进杂乱无章的文档里，而它们背后的上下文，也就这样被永久地弄丢了。'
        },
        Visual: () => (
            <div className="relative w-full max-w-sm aspect-square scale-90">
                {/* Messy Notes Stack */}
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-48 h-56 bg-yellow-100 border border-yellow-200 rounded-lg shadow-lg flex items-center justify-center transform rotate-6 z-10"
                >
                    <StickyNote className="w-12 h-12 text-yellow-400 opacity-50" />
                </motion.div>
                <div className="absolute top-4 right-8 w-48 h-56 bg-pink-100 border border-pink-200 rounded-lg shadow-md transform -rotate-3 opacity-80" />

                {/* Visual Arrow */}
                <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-gray-300 transform rotate-45" />

                {/* Database */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 border-4 border-blue-200 rounded-xl shadow-xl flex items-center justify-center z-20"
                >
                    <Database className="w-16 h-16 text-blue-500" />
                </motion.div>
            </div>
        )
    },
    {
        id: 'philosophy',
        theme: 'bg-white',
        text: {
            step: '02 — The Philosophy',
            headline: 'Treat Prompts\nLike Code.',
            annotation: '// 把提示词当成代码来对待。',
            bodyEn: 'Software engineers don\'t write code in Word docs. They use IDEs and version control. Why should Prompt Engineering be any different?',
            bodyCn: '软件工程师不会在 Word 文档里写代码，他们会使用 IDE 和版本控制工具。那么为什么提示词工程要例外？'
        },
        Visual: () => (
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {/* Image Prompt - Yellow Theme to match Prompt Output */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="col-span-2 bg-yellow-50 border border-yellow-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 h-28 group cursor-default"
                >
                    <div className="p-2 rounded-xl text-yellow-600">
                        <ImageIcon className="w-10 h-10" />
                    </div>
                    <span className="text-xs font-bold text-yellow-700 uppercase tracking-widest">Image Prompt</span>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col items-center gap-2"
                >
                    <LayoutTemplate className="w-8 h-8 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Framework</span>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-purple-50 border border-purple-100 p-6 rounded-2xl flex flex-col items-center gap-2"
                >
                    <BookOpen className="w-8 h-8 text-purple-500" />
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Principle</span>
                </motion.div>
            </div>
        )
    },
    {
        id: 'origin',
        theme: 'bg-white',
        text: {
            step: '03 — The METHODOLOGY',
            headline: 'Redefining\nThe Shortcut.',
            annotation: '// 重新定义 Ctrl+P。',
            bodyEn: 'The workflow is simple: You Copy the text, Paste it here, and instantly—without an extra keystroke—it transforms into a structured Prompt.',
            bodyCn: '工作流很简单：你复制文本，粘贴至此，瞬间——无需额外按键——它就变身为了结构化的 Prompt。'
        },
        Visual: () => (
            <div className="w-full max-w-3xl flex items-center justify-between gap-4 lg:gap-8 relative px-2">
                {/* Step 1: Copy */}
                <div className="flex flex-col items-center gap-4 group cursor-default">
                    <div className="w-20 h-24 bg-blue-50/30 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-200 transform group-hover:-rotate-3 transition-transform duration-300">
                        <Copy className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-mono text-sm text-gray-400 font-bold uppercase tracking-wider">
                        Copy
                    </span>
                </div>

                {/* Arrow 1 */}
                <ArrowRight className="w-6 h-6 text-gray-200 shrink-0" />

                {/* Step 2: Paste */}
                <div className="flex flex-col items-center gap-4 group cursor-default">
                    <div className="w-20 h-24 bg-purple-50/30 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-200 transform group-hover:rotate-3 transition-transform duration-300">
                        <Clipboard className="w-10 h-10 text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-mono text-sm text-gray-400 font-bold uppercase tracking-wider">
                        Paste
                    </span>
                </div>

                {/* Arrow 2 */}
                <ArrowRight className="w-6 h-6 text-gray-200 shrink-0" />

                {/* Step 3: Structured Prompt (Product) */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative"
                >
                    {/* Radial Glow - Yellow */}
                    <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full" />

                    <div className="relative w-48 bg-white border border-gray-100 rounded-xl shadow-2xl p-4 flex flex-col gap-3 transform rotate-2">
                        {/* Prompt Badge - Pale Yellow Theme */}
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                            </div>
                            <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full shadow-sm">
                                PROMPT
                            </span>
                        </div>
                        {/* Simulation of structured content - Yellow accents */}
                        <div className="space-y-2">
                            <div className="h-2 w-16 bg-yellow-100 rounded-full" />
                            <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                            <div className="h-1.5 w-24 bg-gray-100 rounded-full" />
                            <div className="flex gap-1 mt-2">
                                <div className="h-4 w-10 bg-orange-50 rounded" />
                                <div className="h-4 w-10 bg-yellow-50 rounded" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    },
    {
        id: 'creator',
        theme: 'bg-white',
        text: {
            step: 'The Builder',
            headline: 'Self-introduction',
            annotation: '// 写在最后：关于「作者」。',
            bodyEn: 'I am a senior CS student passionate about AI. This is my daily driver, and hopefully, a vital part of your workflow.',
            bodyCn: '我是一名对 AI 充满热情的大四计算机专业学生。这是我每天都会用到的核心工具，希望它也能成为你工作流中不可或缺的一部分。'
        },
        Visual: () => (
            <div className="w-full h-full flex items-center justify-center p-4">
                {/* Dev Access Pass Visual */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full max-w-[450px] h-[220px] flex bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-gray-100 relative group"
                >
                    {/* Identity Section */}
                    <div className="w-full p-6 flex flex-col justify-between relative bg-white">
                        {/* Status Header */}
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-mono font-bold text-gray-400 tracking-widest">OPEN TO WORK</span>
                        </div>

                        {/* Profile Info */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="https://www.xiaohongshu.com/user/profile/5b40d831e8ac2b17ae9c39c2"
                                target="_blank"
                                className="relative w-16 h-16 shrink-0 block cursor-pointer group/avatar"
                            >
                                <Image
                                    src="/avatar.jpg"
                                    alt="Kang Han"
                                    fill
                                    className="object-cover rounded-full ring-2 ring-gray-100 group-hover/avatar:scale-105 group-hover/avatar:shadow-md transition-all duration-300"
                                />
                            </Link>
                            <div>
                                <h3 className="font-serif font-bold text-xl text-gray-900 leading-tight">Kang Han</h3>
                                <p className="font-sans text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">CS SENIOR & AI PRODUCT</p>
                            </div>
                        </div>

                        {/* Tech Stack Badges */}
                        <div className="flex gap-2">
                            {['Prompt Agent', 'Skill', 'VibeCoding'].map((tech) => (
                                <span key={tech} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-medium text-gray-500 font-mono">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }
];

// --- Components ---

const Background = ({ activeIndex }: { activeIndex: number }) => {
    return (
        <div className="fixed inset-0 z-0 transition-colors duration-700 ease-in-out">
            <div className={`absolute inset-0 ${sections[activeIndex].theme}`} />
            {/* Engineering Dot Grid Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px]" />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.02),transparent_40%)]" />
        </div>
    );
};

const TextContent = ({ data, isActive }: { data: any, isActive: boolean }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate={isActive ? "show" : "hidden"}
            className="flex flex-col justify-center h-full max-w-lg px-8 lg:px-0"
        >
            <motion.div variants={item} className="mb-6 border-b border-gray-200 pb-2 inline-block">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">{data.step}</span>
            </motion.div>

            <div className="mb-12">
                <motion.h1 variants={item} className="text-5xl lg:text-6xl font-bold tracking-tight text-black mb-4 font-sans leading-[1.1] whitespace-pre-line">
                    {data.headline}
                </motion.h1>
                {/* Annotation: Increased to text-3xl as requested */}
                <motion.p variants={item} className="text-4xl text-gray-400 font-serif flex items-center gap-2">
                    {data.annotation}
                </motion.p>
            </div>

            <div className="space-y-4">
                {/* Body En: Single Block */}
                <motion.p variants={item} className="text-xl lg:text-2xl leading-relaxed text-gray-500 font-serif font-normal">
                    {data.bodyEn}
                </motion.p>
                {/* Body Cn: Single Block */}
                <motion.p variants={item} className="text-lg lg:text-xl leading-relaxed text-gray-500 font-serif border-l-2 border-gray-200 pl-4">
                    {data.bodyCn}
                </motion.p>
            </div>
        </motion.div>
    );
};

export default function StoryPage() {
    const [activeSection, setActiveSection] = useState(0);

    return (
        <main className="relative h-screen w-full overflow-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="pointer-events-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </motion.div>
                    </Link>

                    {/* Progress Indicator */}
                    <div className="flex gap-2">
                        {sections.map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === activeSection ? 'bg-black' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </nav>

            <Background activeIndex={activeSection} />

            {/* Scroll Container */}
            <div className="relative h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth z-10">
                {sections.map((section, index) => (
                    <section
                        key={section.id}
                        className="h-screen w-full snap-start flex items-center justify-center relative overflow-hidden"
                    >
                        {/* Scroll Spy */}
                        <motion.div
                            onViewportEnter={() => setActiveSection(index)}
                            viewport={{ amount: 0.6 }} // Trigger when 60% visible
                            className="absolute inset-0 pointer-events-none"
                        />

                        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 px-6 h-full items-center">
                            {/* Left Content */}
                            <div className="order-2 lg:order-1 h-full flex flex-col justify-center">
                                <TextContent data={section.text} isActive={activeSection === index} />
                            </div>

                            {/* Right Visual */}
                            <div className="order-1 lg:order-2 h-[40vh] lg:h-full flex items-center justify-center lg:justify-start">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, x: 50 }}
                                    animate={activeSection === index ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.9, x: 50 }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                    className="w-full h-full flex items-center justify-center lg:justify-center p-8 lg:p-0"
                                >
                                    <section.Visual />
                                </motion.div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}
