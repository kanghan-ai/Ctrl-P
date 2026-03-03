/**
 * IndexedDB 图片存储工具
 * 使用 idb-keyval 简化 IndexedDB 操作
 */

import { get, set, del, keys } from 'idb-keyval';

// 图片 ID 前缀
const IDB_PREFIX = 'idb://';

/**
 * 生成唯一的图片 ID
 */
function generateImageId(): string {
    return `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 检查是否是 IndexedDB 引用
 */
export function isIDBReference(value: string): boolean {
    return value.startsWith(IDB_PREFIX);
}

/**
 * 检查是否是 Base64 图片
 */
export function isBase64Image(value: string): boolean {
    return value.startsWith('data:image/');
}

/**
 * 检查是否是 URL
 */
export function isImageURL(value: string): boolean {
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
}

/**
 * 获取图片类型
 */
export function getImageType(value: string): 'url' | 'idb' | 'base64' {
    if (isImageURL(value)) return 'url';
    if (isIDBReference(value)) return 'idb';
    if (isBase64Image(value)) return 'base64';
    return 'url'; // 默认
}

/**
 * 保存图片到 IndexedDB
 * @param file File 或 Blob 对象
 * @returns IDB 引用字符串 (idb://img-xxx)
 */
export async function saveImageToIDB(file: File | Blob): Promise<string> {
    try {
        const id = generateImageId();
        await set(id, file);
        return `${IDB_PREFIX}${id}`;
    } catch (error) {
        console.error('❌ 保存图片到 IndexedDB 失败:', error);
        throw new Error('保存图片失败');
    }
}

/**
 * 从 IndexedDB 读取图片
 * @param reference IDB 引用字符串 (idb://img-xxx)
 * @returns Blob 对象或 null
 */
export async function getImageFromIDB(reference: string): Promise<Blob | null> {
    try {
        const id = reference.replace(IDB_PREFIX, '');
        const blob = await get<Blob>(id);

        if (!blob) {
            console.warn('⚠️ 图片不存在:', id);
            return null;
        }

        return blob;
    } catch (error) {
        console.error('❌ 从 IndexedDB 读取图片失败:', error);
        return null;
    }
}

/**
 * 从 IndexedDB 删除图片
 * @param reference IDB 引用字符串 (idb://img-xxx)
 */
export async function deleteImageFromIDB(reference: string): Promise<void> {
    try {
        const id = reference.replace(IDB_PREFIX, '');
        await del(id);
    } catch (error) {
        console.error('❌ 删除图片失败:', error);
        throw new Error('删除图片失败');
    }
}

/**
 * 创建临时 URL
 * @param blob Blob 对象
 * @returns 临时 URL
 */
export function createImageURL(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    return url;
}

/**
 * 释放临时 URL
 * @param url 临时 URL
 */
export function revokeImageURL(url: string): void {
    URL.revokeObjectURL(url);
}

/**
 * Base64 转 Blob
 */
export function base64ToBlob(base64: string): Blob {
    // 提取 MIME 类型和数据
    const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
        throw new Error('无效的 Base64 字符串');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // 解码 Base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    return new Blob([byteArray], { type: mimeType });
}

/**
 * 迁移 Base64 图片到 IndexedDB
 * @param base64 Base64 字符串
 * @returns IDB 引用字符串
 */
export async function migrateBase64ToIDB(base64: string): Promise<string> {
    const blob = base64ToBlob(base64);
    const reference = await saveImageToIDB(blob);
    return reference;
}

/**
 * 获取所有存储的图片 ID
 */
export async function getAllImageIds(): Promise<string[]> {
    try {
        const allKeys = await keys();
        return allKeys
            .filter(key => typeof key === 'string' && key.startsWith('img-'))
            .map(key => `${IDB_PREFIX}${key}`);
    } catch (error) {
        console.error('❌ 获取图片列表失败:', error);
        return [];
    }
}

/**
 * 清理所有图片
 */
export async function clearAllImages(): Promise<void> {
    try {
        const imageIds = await getAllImageIds();
        for (const id of imageIds) {
            await deleteImageFromIDB(id);
        }
    } catch (error) {
        console.error('❌ 清理图片失败:', error);
        throw new Error('清理图片失败');
    }
}
