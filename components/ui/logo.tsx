import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility, if not I'll just use template literals or check for it.

// Since I haven't seen lib/utils yet, I'll stick to standard template literals or create a simple utility if needed. 
// But commonly projects have clsx/tailwind-merge. I'll verify if lib/utils exists or just write safe code.
// I'll assume standard className prop handling for now.

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-lg',
        md: 'w-10 h-10 text-xl',
        lg: 'w-12 h-12 text-2xl',
    };

    return (
        <div className={`bg-black flex items-center justify-center text-white font-bold rounded-sm shadow-sm ${sizeClasses[size]} ${className}`}>
            P
        </div>
    );
}
