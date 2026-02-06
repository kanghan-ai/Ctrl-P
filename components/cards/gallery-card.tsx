'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { GalleryCardData } from '@/lib/mock-data';
import { Edit2 } from 'lucide-react';

interface GalleryCardProps {
    data: GalleryCardData;
    onEdit?: (id: string) => void;
}

export default function GalleryCard({ data, onEdit }: GalleryCardProps) {
    return (
        <motion.div
            className="col-span-2 row-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card
                onClick={() => onEdit?.(data.id)}
                className="h-full overflow-hidden flex flex-col group cursor-pointer border border-neutral-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-neutral-400 transition-all duration-300"
            >
                <div className="flex h-full">
                    {/* Left Side: Image Content */}
                    <div className="w-1/3 relative p-4 flex items-center justify-center border-r border-neutral-100 overflow-hidden perspective-1000">
                        <div className="relative w-full aspect-square flex items-center justify-center transition-transform duration-500 ease-out -rotate-2 scale-95 group-hover:rotate-0 group-hover:scale-105">
                            <img
                                src={data.images?.[0]}
                                alt={data.title}
                                className="w-full h-full object-cover shadow-[2px_2px_8px_rgba(0,0,0,0.08)]"
                            />
                        </div>
                    </div>

                    {/* Right Side: Text & Details */}
                    <div className="w-2/3 p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold text-neutral-900">{data.title}</h3>
                        </div>

                        <div className="flex-grow bg-yellow-50/50 rounded-lg p-4 border border-yellow-100 mb-4 font-mono text-sm leading-relaxed text-neutral-600 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-300 rounded-l-lg"></div>
                            <span className="line-clamp-2 text-ellipsis overflow-hidden">
                                {data.description}
                            </span>
                        </div>

                        <div className="flex justify-between items-end mt-auto gap-4">
                            <div className="flex flex-wrap gap-2">
                                {data.model && data.model.split(',').map((model, index) => (
                                    <span
                                        key={`model-${index}`}
                                        className="px-3 py-1 bg-white text-neutral-900 text-[10px] font-medium uppercase tracking-wider rounded-full border border-neutral-300 shadow-sm"
                                    >
                                        {model.trim()}
                                    </span>
                                ))}
                                {data.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-white text-neutral-500 text-xs font-medium rounded-full border border-neutral-200 shadow-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div >
    );
}
