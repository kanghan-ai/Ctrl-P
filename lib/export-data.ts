/**
 * 数据导出工具
 * 用于将当前卡片数据导出为 JSON 文件
 */

import { CardData } from './mock-data';

/**
 * 导出当前卡片数据到 JSON 文件
 */
export function exportCardsToJSON(cards: CardData[], filename: string = 'cards.json') {
    // 创建数据结构
    const data = {
        cards: cards,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    // 转换为 JSON 字符串
    const jsonString = JSON.stringify(data, null, 2);

    // 创建 Blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 复制卡片数据到剪贴板
 */
export async function copyCardsToClipboard(cards: CardData[]) {
    const data = {
        cards: cards,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    const jsonString = JSON.stringify(data, null, 2);

    try {
        await navigator.clipboard.writeText(jsonString);
        return true;
    } catch (error) {
        console.error('复制到剪贴板失败:', error);
        return false;
    }
}

/**
 * 打印卡片数据到控制台(便于复制)
 */
export function printCardsToConsole(cards: CardData[]) {
    const data = {
        cards: cards,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    console.log('='.repeat(80));
    console.log('卡片数据导出');
    console.log('='.repeat(80));
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(80));
    console.log(`总计: ${cards.length} 张卡片`);
    console.log('提示: 右键点击上方数据 → "复制对象"');
    console.log('='.repeat(80));
}
