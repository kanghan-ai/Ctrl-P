/**
 * 游客模式本地存储工具 - 纯 IndexedDB 方案
 * 使用 idb-keyval 将卡片数据（含图片 Blob）统一存入 IndexedDB
 */

import { get, set, del } from 'idb-keyval';
import { CardData } from './mock-data';

// IndexedDB 中的唯一 key
export const LOCAL_PROMPTS_KEY = 'local_prompts';

export interface LocalStore {
    cards: CardData[];
    cardOrder: string[];
    version: string;
    lastModified: string;
}

const VERSION = '2.0';

// ─── 读 ───────────────────────────────────────────────

/**
 * 读取本地所有数据
 */
export async function loadLocalData(): Promise<LocalStore | null> {
    try {
        const data = await get<LocalStore>(LOCAL_PROMPTS_KEY);
        return data ?? null;
    } catch (error) {
        console.error('loadLocalData 失败:', error);
        return null;
    }
}

/**
 * 检查是否有本地数据
 */
export async function hasLocalData(): Promise<boolean> {
    const data = await loadLocalData();
    return data !== null && data.cards.length > 0;
}

// ─── 写 ───────────────────────────────────────────────

/**
 * 保存整个数据集合
 */
async function persist(store: LocalStore): Promise<void> {
    await set(LOCAL_PROMPTS_KEY, {
        ...store,
        lastModified: new Date().toISOString(),
    });
}

/**
 * 初始化本地数据（首次使用，写入预设数据）
 */
export async function initLocalData(cards: CardData[]): Promise<void> {
    const store: LocalStore = {
        cards,
        cardOrder: cards.map(c => c.id),
        version: VERSION,
        lastModified: new Date().toISOString(),
    };
    await persist(store);
}

/**
 * 添加卡片（含限制）
 */
export async function addLocalCard(card: CardData): Promise<void> {
    const data = await loadLocalData();
    const cards = data?.cards ?? [];

    if (cards.length >= 50) {
        throw new Error('游客模式最多支持 50 张卡片，请登录解除限制');
    }

    const newCards = [card, ...cards];
    await persist({
        cards: newCards,
        cardOrder: newCards.map(c => c.id),
        version: VERSION,
        lastModified: '',
    });
}

/**
 * 更新卡片
 */
export async function updateLocalCard(card: CardData): Promise<void> {
    const data = await loadLocalData();
    if (!data) return;

    const index = data.cards.findIndex(c => c.id === card.id);
    if (index !== -1) {
        data.cards[index] = card;
        await persist(data);
    }
}

/**
 * 删除卡片
 */
export async function deleteLocalCard(id: string): Promise<void> {
    const data = await loadLocalData();
    if (!data) return;

    data.cards = data.cards.filter(c => c.id !== id);
    data.cardOrder = data.cardOrder.filter(cid => cid !== id);
    await persist(data);
}

/**
 * 重排卡片顺序
 */
export async function reorderLocalCards(newOrder: string[]): Promise<void> {
    const data = await loadLocalData();
    if (!data) return;

    data.cardOrder = newOrder;
    await persist(data);
}

/**
 * 清除所有本地数据
 */
export async function clearLocalData(): Promise<void> {
    await del(LOCAL_PROMPTS_KEY);
    console.log('✅ 本地 IndexedDB 数据已清除');
}
