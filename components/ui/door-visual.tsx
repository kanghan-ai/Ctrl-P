'use client';

import { motion } from 'framer-motion';

export default function DoorVisual() {
    // Static "Slightly Open" State based on reference image
    // Perspective: Door hinges on LEFT, swings OUT and LEFT.
    // This reveals the void on the RIGHT side.

    // Adjustment 9:
    // User wants door handle ALIGNED with center gap (x=160).
    // Previous Handle X (Group): 142. Backplate center ~147.
    // Shift +13px to bring Backplate center to 160.
    // Hinge 87 -> 100.
    // Right Edge 173 -> 186.

    return (
        <div className="w-[320px] h-[300px] flex items-center justify-center relative">
            <svg
                width="320"
                height="300"
                viewBox="0 0 320 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
            >
                {/* 1. THE VOID (Background) */}

                <defs>
                    <filter id="noise" x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence baseFrequency="0.6" numOctaves="3" result="noise" type="fractalNoise" />
                        <feColorMatrix type="saturate" values="0" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.1" />
                        </feComponentTransfer>
                        <feBlend in="SourceGraphic" mode="multiply" />
                    </filter>

                    <linearGradient id="void-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#000" />
                        <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>

                    {/* 
                      Glow Filter for Stars
                      - "Spreading blur" effect using multi-layer blur 
                      - Core + Wide Halo
                    */}
                    <filter id="star-glow" x="-100%" y="-100%" width="300%" height="300%">
                        {/* 1. Wide diffuse glow (halo) */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="haloBlur" />

                        {/* 2. Tighter glow (core) */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="coreBlur" />

                        <feMerge>
                            {/* Stack halo twice for intensity if needed, once is usually enough for subtle */}
                            <feMergeNode in="haloBlur" />
                            <feMergeNode in="coreBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Void Content - Shifted +13 (162 -> 175) */}
                <rect x="175" y="30" width="50" height="230" fill="#050505" />
                <rect x="175" y="30" width="50" height="230" fill="url(#noise)" opacity="0.3" />

                {/* STARS - Shifted +13 */}
                <motion.g filter="url(#star-glow)">
                    {/* 
                        Star Distribution modeled after reference:
                        - Clustered generally in the void (x: 175-225, y: 30-260)
                        - Uneven vertical distribution
                        - Blink effect: mostly invisible (opacity 0), brief flash to 1 or 0.8
                        - Updated: Slower durations (~1.8x longer)
                    */}
                    {[
                        // Primary Stars
                        { cx: 190, cy: 50, r: 1.6, dur: 7.2, delay: 0 },
                        { cx: 215, cy: 75, r: 1.1, dur: 5.4, delay: 2.7 },
                        { cx: 185, cy: 90, r: 0.9, dur: 9.0, delay: 0.9 },
                        { cx: 200, cy: 120, r: 2.0, dur: 10.8, delay: 3.6 },  // Exceptionally bright/large
                        { cx: 182, cy: 145, r: 1.0, dur: 6.3, delay: 1.8 },
                        { cx: 218, cy: 160, r: 1.2, dur: 8.1, delay: 5.4 },
                        { cx: 195, cy: 180, r: 1.8, dur: 9.9, delay: 0.36 },
                        { cx: 188, cy: 210, r: 0.9, dur: 5.0, delay: 2.16 },
                        { cx: 205, cy: 235, r: 1.4, dur: 7.5, delay: 4.5 },
                        { cx: 192, cy: 250, r: 1.1, dur: 6.8, delay: 1.44 },

                        // Small distant stars
                        { cx: 208, cy: 45, r: 0.6, dur: 4.5, delay: 0.18 },
                        { cx: 180, cy: 105, r: 0.6, dur: 5.7, delay: 3.24 },
                        { cx: 220, cy: 195, r: 0.6, dur: 7.3, delay: 3.96 },

                        // Additional High Density Stars
                        { cx: 198, cy: 65, r: 0.8, dur: 5.5, delay: 0.72 },
                        { cx: 178, cy: 80, r: 1.2, dur: 8.4, delay: 3.78 },
                        { cx: 222, cy: 110, r: 0.9, dur: 5.2, delay: 1.98 },
                        { cx: 203, cy: 135, r: 1.5, dur: 9.3, delay: 0.54 },
                        { cx: 188, cy: 155, r: 0.6, dur: 6.4, delay: 3.42 },
                        { cx: 212, cy: 170, r: 1.0, dur: 7.7, delay: 4.86 },
                        { cx: 195, cy: 200, r: 0.8, dur: 4.6, delay: 1.08 },
                        { cx: 220, cy: 225, r: 1.1, dur: 7.0, delay: 2.52 },
                        { cx: 183, cy: 245, r: 0.9, dur: 8.6, delay: 4.14 },
                        { cx: 208, cy: 255, r: 0.8, dur: 5.9, delay: 1.62 },
                        { cx: 192, cy: 28, r: 1.0, dur: 7.2, delay: 2.88 },
                        { cx: 215, cy: 142, r: 0.6, dur: 3.9, delay: 1.26 },
                        { cx: 186, cy: 192, r: 1.2, dur: 9.1, delay: 5.04 },
                        { cx: 202, cy: 218, r: 0.8, dur: 6.1, delay: 2.34 },
                    ].map((star, i) => (
                        <circle cx={star.cx} cy={star.cy} r={star.r} fill="white" opacity="0" key={i}>
                            <animate
                                attributeName="opacity"
                                values="0;0;1.0;0;0"
                                keyTimes="0;0.4;0.5;0.6;1"
                                dur={`${star.dur}s`}
                                begin={`${star.delay}s`}
                                repeatCount="indefinite"
                            />
                        </circle>
                    ))}
                </motion.g>

                {/* 2. GROUND LINE - Adjusted for Handle Alignment */}
                {/* Left Line: 0 to 100 (Was 87) */}
                <line x1="0" y1="260" x2="100" y2="260" stroke="#1A1A1A" strokeWidth="0.8" strokeLinecap="round" />
                {/* Right Line: 186 to 320 (Was 173) */}
                <line x1="186" y1="260" x2="320" y2="260" stroke="#1A1A1A" strokeWidth="0.8" strokeLinecap="round" />

                {/* 3. THE DOOR (Foreground) */}

                {/* Door Body - Shifted +13 */}
                {/* Hinge: 87 -> 100 */}
                {/* Edge: 167 -> 180 */}
                <path
                    d="M100 30 L180 10 L180 280 L100 260 Z"
                    fill="white"
                    stroke="#1A1A1A"
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                />

                {/* Door Thickness - Shifted +13 */}
                {/* 167->180, 173->186 */}
                <path
                    d="M180 10 L186 12 L186 278 L180 280 Z"
                    fill="white"
                    stroke="#1A1A1A"
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                />

                {/* Handle & Latch Group - Shifted +13 (142 -> 155) */}
                {/* Backplate center is now at 160 (155+5) */}
                <g transform="translate(155, 140) skewY(5) scale(0.95)">
                    {/* Backplate */}
                    <path d="M0 0 H 10 V 20 H 0 Z" fill="white" stroke="#1A1A1A" strokeWidth="0.6" />

                    {/* Lever */}
                    <path d="M5 8 H -12 C -14 8 -14 12 -12 12 H 5" fill="white" stroke="#1A1A1A" strokeWidth="0.6" strokeLinecap="round" />
                </g>

                {/* Latch on Thickness - Shifted +13 (170 -> 183) */}
                <rect
                    x="183" y="145"
                    width="2" height="6" fill="white" stroke="#1A1A1A" strokeWidth="0.6"
                />

            </svg>
        </div>
    );
}
