'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { loadLocalData, clearLocalData } from '@/lib/local-store';
import { useData } from '@/lib/store';
import { mockDashboardData } from '@/lib/mock-data';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/modal';

// 预设卡片 ID 集合，用于过滤（预设卡片是演示数据，不需要迁移）
const PRESET_IDS = new Set(mockDashboardData.map(c => c.id));

export default function GuestDataMigration() {
    const { user } = useAuth();
    const { addCard } = useData();
    const [showDialog, setShowDialog] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [cardCount, setCardCount] = useState<number>(0);
    // 防止 Supabase auth 多次触发 user 变化导致弹窗重复出现
    const hasCheckedRef = useRef(false);

    // 检测登录后是否有游客数据需要迁移（只统计用户自建卡片，排除预设卡片）
    useEffect(() => {
        if (!user || hasCheckedRef.current) return;
        hasCheckedRef.current = true; // 只检查一次

        loadLocalData().then(data => {
            if (data && data.cards.length > 0) {
                const userCards = data.cards.filter(c => !PRESET_IDS.has(c.id));
                if (userCards.length > 0) {
                    setCardCount(userCards.length);
                    const timer = setTimeout(() => setShowDialog(true), 500);
                    return () => clearTimeout(timer);
                }
            }
        });
    }, [user]);

    const handleMigrate = async () => {
        setMigrating(true);
        setError(null);
        setProgress(0);

        try {
            const localData = await loadLocalData();
            if (!localData || localData.cards.length === 0) {
                throw new Error('没有找到游客数据');
            }

            // 只迁移用户自建卡片，预设卡片是演示数据不需要迁移
            const cards = localData.cards.filter(c => !PRESET_IDS.has(c.id));
            const total = cards.length;

            if (total === 0) {
                await clearLocalData();
                setSuccess(true);
                setMigrating(false);
                return;
            }



            let successCount = 0;
            const errors: string[] = [];

            // 倒序迁移：Supabase 按 created_at DESC 加载，最后 INSERT 的排最前
            // 所以原始列表第一张卡片应该最后插入，才能保持原始顺序
            for (let i = total - 1; i >= 0; i--) {
                try {
                    const card = cards[i];
                    let cardToMigrate = { ...card } as typeof card & {
                        images?: string[];
                        imageFiles?: (File | Blob | null)[];
                    };

                    if (cardToMigrate.type === 'gallery' && cardToMigrate.imageFiles?.length) {
                        // 将 imageFiles 上传到 Supabase Storage，获取永久 URL
                        const { compressImageToWebP, uploadImageToStorage } = await import('@/lib/image-upload');
                        const permanentUrls: string[] = [];

                        for (const blob of cardToMigrate.imageFiles) {
                            if (!blob) continue;
                            try {
                                // File 已是 File 类型；Blob 需要包一个 File 壳
                                const file = blob instanceof File
                                    ? blob
                                    : new File([blob], 'image.webp', { type: blob.type || 'image/webp' });
                                const compressed = await compressImageToWebP(file);
                                const url = await uploadImageToStorage(compressed, user!.id);
                                permanentUrls.push(url);
                            } catch {
                                // 单张图片上传失败，跳过，不影响其他图片
                            }
                        }

                        // 用永久 URL 替换 images[]（保留预设路径，追加已上传的图片）
                        const existingPaths = (cardToMigrate.images ?? []).filter(
                            (url: string) => url && !url.startsWith('blob:')
                        );
                        cardToMigrate.images = [...existingPaths, ...permanentUrls];
                        delete cardToMigrate.imageFiles; // 移除非 Supabase 字段
                    } else if (cardToMigrate.type === 'gallery') {
                        // 无 imageFiles：只过滤掉无效的 blob URL
                        delete cardToMigrate.imageFiles;
                        if (cardToMigrate.images) {
                            cardToMigrate.images = cardToMigrate.images.filter(
                                (url: string) => url && !url.startsWith('blob:')
                            );
                        }
                    }

                    // 生成新的唯一 ID（避免主键冲突）
                    const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
                    cardToMigrate = { ...cardToMigrate, id: newId };

                    await addCard(cardToMigrate, true);
                    successCount++;
                    setProgress(((i + 1) / total) * 100);
                } catch (err) {
                    console.error(`❌ 卡片 ${i + 1} 迁移失败:`, err);
                    const errorMsg = err instanceof Error ? err.message : '未知错误';
                    errors.push(`卡片 ${i + 1}: ${errorMsg}`);
                }
            }


            if (errors.length > 0) {
                console.warn('⚠️ 失败详情:', errors);
            }

            // 迁移完成，自动清除 IDB，防止下次登录重复弹窗
            await clearLocalData();
            setSuccess(true);
        } catch (err) {
            console.error('❌ 迁移失败:', err);
            setError(err instanceof Error ? err.message : '迁移失败');
        } finally {
            setMigrating(false);
        }
    };

    const handleSkip = () => {
        setShowDialog(false);
    };

    const handleDiscard = async () => {
        // 迁移前放弃游客数据
        await clearLocalData();
        setShowDialog(false);
    };

    if (!showDialog) return null;

    return (
        <Modal isOpen={showDialog} onClose={handleSkip} title="Found Local Data" hideHeader={true} maxWidth="max-w-[480px]">
            <div className="relative flex flex-col pt-6 pb-6 w-full bg-white rounded-xl font-sans text-center">
                {/* Minimal Header - Hide on Success */}
                {!success && (
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-neutral-900" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-serif text-neutral-900">Found Local Data</h2>
                    </div>
                )}

                {/* Content */}
                <div className="px-10 mb-8 text-left">
                    {!migrating && !success && (
                        <ul className="space-y-4 list-disc list-outside ml-4 marker:text-neutral-400">
                            <li className="text-base text-neutral-600 leading-relaxed pl-1">
                                We found <span className="font-semibold text-neutral-900">{cardCount} cards</span> created in Viewer Mode.
                            </li>
                            <li className="text-base text-neutral-600 leading-relaxed pl-1">
                                Would you like to <span className="font-semibold text-neutral-900 border-b border-neutral-200">migrate them to your account</span>?
                            </li>
                        </ul>
                    )}

                    {migrating && (
                        <div className="space-y-4">
                            <p className="text-sm text-neutral-900 font-medium text-center">Migrating data...</p>
                            {/* Progress Bar */}
                            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-neutral-900 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
                        </div>
                    )}

                    {success && (
                        <div className="space-y-4 text-center">
                            <div className="mx-auto w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <p className="text-base text-neutral-900 font-medium">Migration Complete</p>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                Your cards have been saved to your account.
                            </p>
                        </div>
                    )}
                </div>

                {/* 迁移前操作区 */}
                {!migrating && !success && (
                    <div className="flex flex-col gap-3 px-6">
                        <div className="flex flex-row gap-2 items-center justify-around w-full">
                            <button
                                onClick={handleMigrate}
                                className="flex-1 h-11 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-black transition-all shadow-sm text-base px-2 whitespace-nowrap"
                            >
                                Import to Account
                            </button>
                            <button
                                onClick={handleSkip}
                                className="flex-1 h-11 bg-white border border-neutral-200 text-neutral-600 rounded-lg font-medium hover:bg-neutral-50 transition-colors text-base px-2 whitespace-nowrap"
                            >
                                Decide Later
                            </button>
                        </div>
                        <button
                            onClick={handleDiscard}
                            className="text-sm text-neutral-400 hover:text-red-600 hover:underline transition-colors mt-1"
                        >
                            I don&apos;t need this data, discard it.
                        </button>
                    </div>
                )}

                {/* 迁移成功后的操作区 */}
                {!migrating && success && (
                    <div className="flex flex-col gap-3 px-6">
                        <button
                            onClick={() => setShowDialog(false)}
                            className="w-full h-11 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-black transition-all shadow-sm text-base"
                        >
                            OK
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
