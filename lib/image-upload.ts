/**
 * 图片上传工具函数
 * 负责图片压缩、格式转换和上传到 Supabase Storage
 */

import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

/**
 * 压缩图片为 WebP 格式
 * @param file 原始图片文件
 * @returns 压缩后的 Blob (WebP 格式)
 */
export async function compressImageToWebP(file: File): Promise<Blob> {

    try {
        // 第一步: 使用 browser-image-compression 压缩
        const options = {
            maxSizeMB: 0.3,              // 目标大小 300KB
            maxWidthOrHeight: 1920,       // 最大宽高
            useWebWorker: true,           // 使用 Web Worker 提升性能
            fileType: 'image/webp',       // 转换为 WebP
            initialQuality: 0.7,          // 初始质量
        };

        const compressedFile = await imageCompression(file, options);

        return compressedFile;
    } catch (error) {
        console.error('❌ 图片压缩失败:', error);
        throw new Error('图片压缩失败，请重试');
    }
}

/**
 * 上传图片到 Supabase Storage
 * @param file 压缩后的图片文件
 * @param userId 用户 ID (用于文件路径)
 * @returns 图片的公开 URL
 */
export async function uploadImageToStorage(
    file: Blob,
    userId: string
): Promise<string> {
    try {
        // 生成唯一文件名
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileName = `${userId}/${timestamp}-${randomStr}.webp`;

        // 上传到 prompt-images bucket
        const { data, error } = await supabase.storage
            .from('prompt-images')
            .upload(fileName, file, {
                contentType: 'image/webp',
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('❌ 上传失败:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('prompt-images')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('❌ 上传到 Storage 失败:', error);
        throw new Error('图片上传失败，请重试');
    }
}

/**
 * 完整的图片上传流程
 * @param file 原始图片文件
 * @param userId 用户 ID
 * @returns 图片的公开 URL
 */
export async function uploadPromptImage(
    file: File,
    userId: string
): Promise<string> {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件');
    }

    // 验证文件大小 (限制 10MB)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('图片文件过大，请选择小于 10MB 的图片');
    }

    // 1. 压缩图片
    const compressedBlob = await compressImageToWebP(file);

    // 2. 上传到 Storage
    const publicUrl = await uploadImageToStorage(compressedBlob, userId);

    return publicUrl;
}

/**
 * 删除图片 (可选功能)
 * @param imageUrl 图片 URL
 */
export async function deletePromptImage(imageUrl: string): Promise<void> {
    try {
        // 从 URL 提取文件路径
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/prompt-images\/(.+)$/);

        if (!pathMatch) {
            throw new Error('无效的图片 URL');
        }

        const filePath = pathMatch[1];

        const { error } = await supabase.storage
            .from('prompt-images')
            .remove([filePath]);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('❌ 删除图片失败:', error);
        throw new Error('删除图片失败');
    }
}
