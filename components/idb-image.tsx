'use client';

import { useState, useEffect, useRef } from 'react';
import {
    getImageFromIDB,
    createImageURL,
    revokeImageURL,
    getImageType,
    migrateBase64ToIDB,
} from '@/lib/image-storage';

interface IDBImageProps {
    src: string; // 可以是 URL、IDB 引用或 Base64
    alt?: string;
    className?: string;
    onMigrate?: (newSrc: string) => void; // Base64 迁移后的回调
}

/**
 * 智能图片组件
 * - URL: 直接显示
 * - IDB (idb://): 从 IndexedDB 加载并创建临时 URL
 * - Base64: 可选自动迁移到 IDB
 */
export function IDBImage({ src, alt = 'Image', className = '', onMigrate }: IDBImageProps) {
    const [displayUrl, setDisplayUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // 用 ref 保存 onMigrate，避免它的引用变化触发 effect 重跑
    const onMigrateRef = useRef(onMigrate);
    useEffect(() => {
        onMigrateRef.current = onMigrate;
    }, [onMigrate]);

    useEffect(() => {
        // 仅以 src 作为依赖，onMigrate 通过 ref 访问
        if (!src) {
            setLoading(false);
            return;
        }

        let objectURL: string | null = null;
        let cancelled = false;

        async function loadImage() {
            setLoading(true);
            setError(false);

            try {
                const imageType = getImageType(src);

                if (imageType === 'url') {
                    if (!cancelled) {
                        setDisplayUrl(src);
                        setLoading(false);
                    }
                } else if (imageType === 'idb') {
                    const blob = await getImageFromIDB(src);

                    if (cancelled) return;

                    if (blob) {
                        objectURL = createImageURL(blob);
                        setDisplayUrl(objectURL);
                        setLoading(false);
                    } else {
                        setError(true);
                        setLoading(false);
                    }
                } else if (imageType === 'base64') {
                    if (onMigrateRef.current) {
                        // 迁移到 IDB
                        try {
                            const idbRef = await migrateBase64ToIDB(src);
                            if (cancelled) return;

                            onMigrateRef.current(idbRef);

                            const blob = await getImageFromIDB(idbRef);
                            if (cancelled) return;

                            if (blob) {
                                objectURL = createImageURL(blob);
                                setDisplayUrl(objectURL);
                            } else {
                                // 回退到直接显示 base64
                                setDisplayUrl(src);
                            }
                        } catch {
                            if (!cancelled) setDisplayUrl(src);
                        }
                    } else {
                        // 不迁移，直接显示 Base64
                        if (!cancelled) setDisplayUrl(src);
                    }
                    if (!cancelled) setLoading(false);
                }
            } catch (err) {
                console.error('IDBImage 加载图片失败:', err);
                if (!cancelled) {
                    setError(true);
                    setLoading(false);
                }
            }
        }

        loadImage();

        // 清理：标记取消，并释放 blob URL
        return () => {
            cancelled = true;
            if (objectURL) {
                revokeImageURL(objectURL);
                objectURL = null;
            }
        };
    }, [src]); // ✅ 只依赖 src，onMigrate 通过 ref 稳定访问

    if (loading) {
        return (
            <div className={`bg-neutral-100 animate-pulse ${className}`} />
        );
    }

    if (error || !displayUrl) {
        return (
            <div className={`bg-neutral-100 flex items-center justify-center ${className}`}>
                <span className="text-neutral-400 text-xs">Failed to load</span>
            </div>
        );
    }

    return (
        <img
            src={displayUrl}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    );
}
