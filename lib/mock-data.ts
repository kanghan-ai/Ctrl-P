export interface GalleryCardData {
    type: 'gallery';
    id: string;
    user_id?: string;  // Supabase user ID
    images: string[];
    imageFiles?: (File | Blob | null)[]; // 游客模式：原始图片，与 images[] 一一对应
    title: string;
    description: string;
    tags: string[];
    model?: string;
    source?: string;
    sourceUrl?: string;
    created_at?: string;
    updated_at?: string;
}

export interface FrameworkCardData {
    type: 'framework';
    id: string;
    user_id?: string;  // Supabase user ID
    title: string;
    patternType: string; // Formerly frameworkName
    code: string;
    layout?: 'vertical' | 'horizontal';
    source?: string;       // 来源名称
    sourceUrl?: string;    // 来源链接
    explanation?: string;  // 一句话解释
    example?: string;      // 示例内容
    created_at?: string;
    updated_at?: string;
}

export interface PrincipleCardData {
    type: 'principle';
    id: string;
    user_id?: string;  // Supabase user ID
    words: string;           // 中文短句 (e.g. "具体明确")
    sentence: string;        // 英文长句 (e.g. "Be specific in your instructions")
    explanation?: string;    // 一句话解释
    example?: string;        // 示例
    prompt?: string;         // 可选的 Prompt 示例
    source?: string;         // 来源名称
    sourceUrl?: string;      // 来源链接
    color: 'yellow' | 'cyan' | 'magenta';
    created_at?: string;
    updated_at?: string;
}

export type CardData = GalleryCardData | FrameworkCardData | PrincipleCardData;

import presetCardsRaw from './preset-cards.json';

const presetCards = ((presetCardsRaw as any).cards as any[]).map((card, index) => ({
    ...card,
    id: card.id || `preset-${index}`,
    type: card.type || 'gallery',
    // 修复字段名不匹配问题：将 frameworkName 转换为 patternType
    patternType: card.patternType || card.frameworkName || (card.type === 'framework' ? 'General' : undefined)
})) as CardData[];

export const mockGalleryData: GalleryCardData[] = presetCards.filter(c => c.type === 'gallery') as GalleryCardData[];
export const mockFrameworkData: FrameworkCardData[] = presetCards.filter(c => c.type === 'framework') as FrameworkCardData[];
export const mockPrincipleData: PrincipleCardData[] = presetCards.filter(c => c.type === 'principle') as PrincipleCardData[];

export const mockDashboardData: CardData[] = presetCards;
