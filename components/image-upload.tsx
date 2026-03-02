'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadPromptImage } from '@/lib/image-upload';

interface ImageUploadProps {
    onUploadSuccess: (imageUrl: string) => void;
    onUploadStart?: () => void;
    onUploadError?: (error: string) => void;
    userId: string;
    currentImageUrl?: string;
}

export function ImageUpload({
    onUploadSuccess,
    onUploadStart,
    onUploadError,
    userId,
    currentImageUrl,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // 显示预览
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // 开始上传
            setUploading(true);
            setProgress(0);
            onUploadStart?.();

            // 模拟进度 (实际压缩和上传)
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            // 上传图片
            const imageUrl = await uploadPromptImage(file, userId);

            clearInterval(progressInterval);
            setProgress(100);

            // 上传成功
            onUploadSuccess(imageUrl);
            setPreview(imageUrl);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '上传失败';
            onUploadError?.(errorMessage);
            setPreview(null);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />

            {!preview ? (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={uploading}
                    className="w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg hover:border-neutral-400 transition-colors flex flex-col items-center justify-center gap-3 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                            <div className="text-sm text-neutral-600">
                                上传中... {progress}%
                            </div>
                            <div className="w-48 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-neutral-800 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-neutral-400" />
                            <div className="text-sm text-neutral-600">
                                点击上传图片
                            </div>
                            <div className="text-xs text-neutral-400">
                                支持 JPG、PNG、WebP，自动压缩至 300KB
                            </div>
                        </>
                    )}
                </button>
            ) : (
                <div className="relative w-full h-48 border border-neutral-200 rounded-lg overflow-hidden group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain bg-neutral-50"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={handleClick}
                            disabled={uploading}
                            className="px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors text-sm font-medium"
                        >
                            <Upload className="w-4 h-4 inline mr-1" />
                            重新上传
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={uploading}
                            className="px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors text-sm font-medium"
                        >
                            <X className="w-4 h-4 inline mr-1" />
                            移除
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
