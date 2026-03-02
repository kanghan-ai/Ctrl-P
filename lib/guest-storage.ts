/**
 * 游客模式本地存储工具
 * 负责在 localStorage 中管理未登录用户的数据
 */

import { CardData } from './mock-data';

const GUEST_CARDS_KEY = 'guest_cards';
const GUEST_CARD_ORDER_KEY = 'guest_card_order';
const GUEST_DATA_VERSION = '1.0';

export interface GuestData {
    cards: CardData[];
    cardOrder: string[];
    version: string;
    lastModified: string;
}

/**
 * 加载游客数据
 */
export function loadGuestData(): GuestData | null {
    try {
        const cardsJson = localStorage.getItem(GUEST_CARDS_KEY);
        const orderJson = localStorage.getItem(GUEST_CARD_ORDER_KEY);

        if (!cardsJson) {
            return null;
        }

        const cards: CardData[] = JSON.parse(cardsJson);
        const cardOrder: string[] = orderJson ? JSON.parse(orderJson) : cards.map(c => c.id);

        return {
            cards,
            cardOrder,
            version: GUEST_DATA_VERSION,
            lastModified: new Date().toISOString()
        };
    } catch (error) {
        console.error('Failed to load guest data:', error);
        return null;
    }
}

/**
 * 保存游客数据
 */
export function saveGuestData(data: Partial<GuestData>): void {
    try {
        if (data.cards) {
            localStorage.setItem(GUEST_CARDS_KEY, JSON.stringify(data.cards));
        }
        if (data.cardOrder) {
            localStorage.setItem(GUEST_CARD_ORDER_KEY, JSON.stringify(data.cardOrder));
        }
    } catch (error) {
        console.error('Failed to save guest data:', error);
        throw new Error('保存失败,可能是存储空间不足');
    }
}

/**
 * 添加卡片
 */
export function addGuestCard(card: CardData): void {
    const data = loadGuestData();
    const cards = data?.cards || [];

    // 检查数量限制 (游客最多50张)
    if (cards.length >= 50) {
        throw new Error('游客模式最多支持50张卡片,请登录解除限制');
    }

    cards.push(card);
    const cardOrder = cards.map(c => c.id);

    saveGuestData({ cards, cardOrder });
}

/**
 * 更新卡片
 */
export function updateGuestCard(card: CardData): void {
    const data = loadGuestData();
    if (!data) return;

    const index = data.cards.findIndex(c => c.id === card.id);
    if (index !== -1) {
        data.cards[index] = card;
        saveGuestData({ cards: data.cards });
    }
}

/**
 * 删除卡片
 */
export function deleteGuestCard(id: string): void {
    const data = loadGuestData();
    if (!data) return;

    const cards = data.cards.filter(c => c.id !== id);
    const cardOrder = data.cardOrder.filter(cid => cid !== id);

    saveGuestData({ cards, cardOrder });
}

/**
 * 重新排序卡片
 */
export function reorderGuestCards(newOrder: string[]): void {
    saveGuestData({ cardOrder: newOrder });
}

/**
 * 清除游客数据
 */
export async function clearGuestData(): Promise<void> {
    localStorage.removeItem(GUEST_CARDS_KEY);
    localStorage.removeItem(GUEST_CARD_ORDER_KEY);

    // 清理 IndexedDB 中的图片
    try {
        const { clearAllImages } = await import('./image-storage');
        await clearAllImages();
        console.log('✅ 游客数据和图片已清除');
    } catch (error) {
        console.error('清理 IndexedDB 图片失败:', error);
    }
}

/**
 * 检查是否有游客数据
 */
export function hasGuestData(): boolean {
    return localStorage.getItem(GUEST_CARDS_KEY) !== null;
}

/**
 * 获取游客数据统计
 */
export function getGuestDataStats() {
    const data = loadGuestData();
    if (!data) {
        return { cardCount: 0, storageUsed: 0 };
    }

    const storageUsed = new Blob([JSON.stringify(data.cards)]).size;

    return {
        cardCount: data.cards.length,
        storageUsed, // bytes
        storageLimit: 50, // 最多50张卡片
        canAddMore: data.cards.length < 50
    };
}
