'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FrameworkCardData } from '@/lib/mock-data';
import { Box, Code, Edit2 } from 'lucide-react';

interface FrameworkCardProps {
    data: FrameworkCardData;
    onEdit?: (id: string) => void;
}

export default function FrameworkCard({ data, onEdit }: FrameworkCardProps) {
    const spanClass = data.layout === 'horizontal'
        ? 'col-span-2 row-span-1'
        : 'col-span-1 row-span-2';

    // Fixed height classes to maintain grid rhythm
    // Horizontal: h-72 (288px)
    // Vertical: 288px * 2 + 24px (gap) = 600px -> h-[600px]
    const heightClass = data.layout === 'horizontal'
        ? 'h-72'
        : 'h-[455px]';

    return (
        <motion.div
            className={`${spanClass} ${heightClass}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <Card
                onClick={() => onEdit?.(data.id)}
                className="h-full flex flex-col bg-white hover:border-neutral-400 transition-all duration-300 group relative shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
                <CardHeader className="pb-4 pt-5 px-5 border-b border-neutral-100 flex flex-row items-center justify-between space-y-0 shrink-0">
                    <div className="flex items-center gap-2 text-neutral-400">
                        <Box className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">Framework</span>
                    </div>
                </CardHeader>

                <CardContent className="p-5 flex-grow flex flex-col min-h-0">
                    <h3 className="text-2xl font-bold text-neutral-800 mb-4 shrink-0 truncate">{data.title}</h3>

                    <div className="relative flex-grow bg-neutral-50 rounded-xl border border-neutral-200 p-5 font-mono text-sm text-neutral-600 overflow-hidden group/code w-full">
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 text-neutral-200 pointer-events-none">
                            <Code className="w-16 h-16 opacity-50" />
                        </div>
                        <div className="relative z-10 whitespace-pre-wrap leading-relaxed">
                            {data.code}
                        </div>
                        {/* Gradient Mask for Overflow */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neutral-50 to-transparent z-20" />
                    </div>

                    <div className="mt-5 flex items-center gap-2 shrink-0">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                        <span className="text-sm text-neutral-400 font-medium">{data.frameworkName}</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
