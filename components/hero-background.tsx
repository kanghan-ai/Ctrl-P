'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function HeroBackground() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const springX2 = useSpring(mouseX, { damping: 40, stiffness: 100 });
    const springY2 = useSpring(mouseY, { damping: 40, stiffness: 100 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            // Normalize to -0.5 to 0.5 range to move relative to center or just use raw coords for following
            // Let's make them move slightly *away* or towards. subtle movement.
            // Actually, let's make them follow the mouse broadly.
            mouseX.set(clientX - innerWidth / 2);
            mouseY.set(clientY - innerHeight / 2);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Transform spring values for parallax effect
    const x1 = useTransform(springX, (val) => val * 0.2); // Moves 20% of mouse distance
    const y1 = useTransform(springY, (val) => val * 0.2);

    const x2 = useTransform(springX2, (val) => val * -0.15); // Moves opposite direction
    const y2 = useTransform(springY2, (val) => val * -0.15);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Soft Gradient Mesh */}
            <div className="absolute inset-0 bg-white" />

            <motion.div
                className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/60 to-purple-100/60 rounded-full blur-[100px] opacity-70 mix-blend-multiply"
                style={{ x: x1, y: y1 }}
            />

            <motion.div
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-amber-100/60 to-orange-100/60 rounded-full blur-[100px] opacity-70 mix-blend-multiply"
                style={{ x: x2, y: y2 }}
            />

            {/* Grid Pattern overlay with low opacity */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />

            {/* Interactive Spotlight (Subtle) */}
            <motion.div
                className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{
                    x: springX,
                    y: springY,
                    translateX: '-50%',
                    translateY: '-50%'
                }}
            />
        </div>
    );
}
