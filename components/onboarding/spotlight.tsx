import { useEffect, useState } from 'react';

interface SpotlightProps {
    targetSelector: string | null;
    children: React.ReactNode;
}

export default function Spotlight({ targetSelector, children }: SpotlightProps) {
    const [position, setPosition] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!targetSelector) {
            setPosition(null);
            return;
        }

        const updatePosition = () => {
            const element = document.querySelector(targetSelector);
            if (element) {
                const rect = element.getBoundingClientRect();
                setPosition(rect);
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [targetSelector]);

    if (!position) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 max-w-lg mx-4">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* SVG 遮罩层 */}
            <svg
                className="fixed inset-0 z-40 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
            >
                <defs>
                    <mask id="spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {/* 镂空高亮区域 */}
                        <rect
                            x={position.left - 8}
                            y={position.top - 8}
                            width={position.width + 16}
                            height={position.height + 16}
                            rx="12"
                            fill="black"
                        />
                    </mask>
                </defs>
                {/* 半透明遮罩 */}
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.7)"
                    mask="url(#spotlight-mask)"
                />
            </svg>

            {/* 脉冲高亮环 */}
            <div
                className="fixed z-40 pointer-events-none border-4 border-white rounded-xl animate-pulse-ring"
                style={{
                    left: position.left - 8,
                    top: position.top - 8,
                    width: position.width + 16,
                    height: position.height + 16,
                }}
            />

            {/* 提示框 */}
            <div className="fixed z-50 pointer-events-none">
                <div
                    className="absolute pointer-events-auto"
                    style={{
                        left: position.left + position.width / 2,
                        top: position.bottom + 20,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm">
                        {children}
                    </div>
                    {/* 箭头 */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 -top-3"
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: '12px solid transparent',
                            borderRight: '12px solid transparent',
                            borderBottom: '12px solid white',
                        }}
                    />
                </div>
            </div>
        </>
    );
}
