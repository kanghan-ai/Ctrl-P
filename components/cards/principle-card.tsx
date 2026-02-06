import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { PrincipleCardData } from '@/lib/mock-data';


interface PrincipleCardProps {
    data: PrincipleCardData;
    onEdit?: (id: string) => void;
}

export default function PrincipleCard({ data, onEdit }: PrincipleCardProps) {
    return (
        <motion.div
            className="col-span-1 row-span-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <Card
                onClick={() => onEdit?.(data.id)}
                className="h-full flex flex-col justify-center p-6 relative overflow-hidden group hover:border-neutral-400 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-white"
            >
                <h3 className="text-2xl font-bold text-neutral-900 leading-tight mb-4 tracking-tight">
                    {data.words}
                </h3>

                <div className="border-l-4 border-neutral-200 pl-4 py-1 group-hover:border-neutral-400 transition-colors duration-300">
                    <p className="text-sm text-neutral-500 font-medium leading-relaxed line-clamp-3">
                        {data.sentence}
                    </p>
                </div>
            </Card>
        </motion.div>
    );
}
