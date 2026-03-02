'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { CardData, GalleryCardData, mockDashboardData } from './mock-data';
import { useAuth } from '@/components/auth/auth-provider';
import {
    loadLocalData,
    initLocalData,
    addLocalCard,
    updateLocalCard,
    deleteLocalCard,
    reorderLocalCards,
} from './local-store';

export interface LayoutItem {
    i: string; // card id
    x: number;
    y: number;
    w: number;
    h: number;
}

interface DataContextType {
    cards: CardData[];
    layout: LayoutItem[];
    addCard: (card: CardData, preserveId?: boolean) => Promise<void>;
    updateCard: (card: CardData) => Promise<void>;
    deleteCard: (id: string) => Promise<void>;
    updateLayout: (newLayout: LayoutItem[]) => void;
    reorderCards: (newOrder: string[]) => Promise<void>;
    isGuest: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [cards, setCards] = useState<CardData[]>([]);
    const [layout, setLayout] = useState<LayoutItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 跟踪游客模式加载时创建的 blob URL，组件卸载时统一释放
    const blobURLsRef = useRef<string[]>([]);

    // 为卡片中的 imageFiles 生成 blob URL，注入到 images[]
    function hydrateCardImages(cards: CardData[]): CardData[] {
        // 先释放旧的 blob URLs
        blobURLsRef.current.forEach(url => URL.revokeObjectURL(url));
        blobURLsRef.current = [];

        return cards.map(card => {
            if (card.type !== 'gallery') return card;
            const galleryCard = card as GalleryCardData;
            if (!galleryCard.imageFiles || galleryCard.imageFiles.length === 0) return card;

            const hydratedImages = galleryCard.imageFiles.map((blob, i) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    blobURLsRef.current.push(url);
                    return url;
                }
                // fallback: 保留原有 images[] 里的值（如预设卡片的 /images/defaults/...）
                return galleryCard.images[i] ?? '';
            });

            return { ...galleryCard, images: hydratedImages };
        });
    }

    // Load from API or IndexedDB based on auth status
    // ⚠️ 必须等 authLoading=false，否则 user=null 时误以为是游客，会错误写入 IDB
    useEffect(() => {
        if (authLoading) return; // 等待 Supabase 确认 auth 状态

        async function loadData() {
            try {
                if (user) {
                    // 已登录: 从 Supabase 加载
                    const response = await fetch('/api/cards');
                    if (!response.ok) throw new Error('Failed to fetch cards');
                    const data = await response.json();
                    const fetchedCards: CardData[] = data.cards || [];
                    setCards(fetchedCards);
                    setLayout(generateDefaultLayout(fetchedCards));
                } else {
                    // 游客模式: 从 IndexedDB 加载
                    const localData = await loadLocalData();
                    if (localData && localData.cards.length > 0) {
                        const hydrated = hydrateCardImages(localData.cards);
                        setCards(hydrated);
                        setLayout(generateDefaultLayout(hydrated));
                    } else {
                        // 首次使用或 IDB 已被清空：写入预设数据
                        await initLocalData(mockDashboardData);
                        setCards(mockDashboardData);
                        setLayout(generateDefaultLayout(mockDashboardData));
                    }
                }
                setIsLoaded(true);
            } catch (error) {
                console.error('Error loading cards:', error);
                setCards([]);
                setLayout([]);
                setIsLoaded(true);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();

        // 组件卸载时释放所有 blob URL
        return () => {
            blobURLsRef.current.forEach(url => URL.revokeObjectURL(url));
            blobURLsRef.current = [];
        };
    }, [user, authLoading]);

    const generateDefaultLayout = (cardsData: CardData[]): LayoutItem[] => {
        let currentY = 0;
        return cardsData.map((card) => {
            const w = card.type === 'gallery' ? 2 : card.type === 'framework' && card.layout === 'horizontal' ? 2 : 1;
            const h = card.type === 'gallery' ? 2 : card.type === 'framework' && card.layout === 'vertical' ? 2 : 1;

            const item = { i: card.id, x: 0, y: currentY, w, h };
            currentY += h;
            return item;
        });
    };

    const addCard = async (card: CardData, preserveId = false) => {
        // 根据场景决定是否保留原 id
        const newCard = preserveId
            ? { ...card } // 保留原 id（迁移场景）
            : { ...card, id: Date.now().toString() }; // 生成新 id（新建场景）

        console.log('📝 addCard:', {
            preserveId,
            originalId: card.id,
            finalId: newCard.id,
            isGuest: !user
        });

        // Optimistic update
        setCards(prev => [newCard, ...prev]);

        const w = newCard.type === 'gallery' ? 2 : newCard.type === 'framework' && newCard.layout === 'horizontal' ? 2 : 1;
        const h = newCard.type === 'gallery' ? 2 : newCard.type === 'framework' && newCard.layout === 'vertical' ? 2 : 1;
        setLayout(prev => [{ i: newCard.id, x: 0, y: 0, w, h }, ...prev]);

        try {
            if (user) {
                // 已登录: 保存到 Supabase
                console.log('💾 保存到 Supabase:', newCard.id);
                const response = await fetch('/api/cards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCard)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('❌ API 错误:', errorData);
                    throw new Error('Failed to create card');
                }

                const result = await response.json();
                console.log('✅ 保存成功:', result);
            } else {
                // 游客模式: 保存到 IndexedDB
                await addLocalCard(newCard);
                // 若有 imageFiles，更新 blob URL
                if (newCard.type === 'gallery' && (newCard as GalleryCardData).imageFiles?.length) {
                    const hydrated = hydrateCardImages([newCard])[0];
                    setCards(prev => prev.map(c => c.id === newCard.id ? hydrated : c));
                }
            }
        } catch (error) {
            console.error('❌ Error creating card:', error);
            // Revert optimistic update on failure
            setCards(prev => prev.filter(c => c.id !== newCard.id));
            setLayout(prev => prev.filter(item => item.i !== newCard.id));
            throw error; // 重新抛出错误以便UI处理
        }
    };

    const updateCard = async (card: CardData) => {
        // Optimistic update
        setCards(prev => prev.map(c => c.id === card.id ? card : c));

        try {
            if (user) {
                // 已登录: 更新到 Supabase
                const response = await fetch(`/api/cards/${card.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(card)
                });

                if (!response.ok) {
                    throw new Error('Failed to update card');
                }
            } else {
                // 游客模式: 更新到 IndexedDB
                await updateLocalCard(card);
            }
        } catch (error) {
            console.error('Error updating card:', error);
        }
    };

    const deleteCard = async (id: string) => {
        // Optimistic update
        const cardToDelete = cards.find(c => c.id === id);
        setCards(prev => prev.filter(c => c.id !== id));
        setLayout(prev => prev.filter(item => item.i !== id));

        try {
            if (user) {
                // 已登录: 从 Supabase 删除
                const response = await fetch(`/api/cards/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete card');
                }
            } else {
                // 游客模式: 从 IndexedDB 删除
                await deleteLocalCard(id);
            }
        } catch (error) {
            console.error('Error deleting card:', error);
            // Revert optimistic update on failure
            if (cardToDelete) {
                setCards(prev => [...prev, cardToDelete]);
            }
        }
    };

    const updateLayout = (newLayout: LayoutItem[]) => {
        setLayout(newLayout);
    };

    const reorderCards = async (newOrder: string[]) => {
        // Create a map for O(1) lookups
        const cardMap = new Map(cards.map(c => [c.id, c]));

        // Reconstruct the cards array based on newOrder
        const reorderedCards = newOrder
            .map(id => cardMap.get(id))
            .filter((c): c is CardData => c !== undefined);

        // Append any cards that might be missing from the order (safety measure)
        const missingCards = cards.filter(c => !newOrder.includes(c.id));

        const finalCards = [...reorderedCards, ...missingCards];

        // Optimistic update
        setCards(finalCards);

        // 保存顺序
        if (user) {
            // 已登录: 保存到 Supabase (原有逻辑)
        } else {
            // 游客模式: 保存顺序到 IndexedDB（异步，不阻塞 UI）
            reorderLocalCards(newOrder).catch(console.error);
        }

        try {
            // Persist the new order to the server
            const response = await fetch('/api/cards', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cards: finalCards })
            });

            if (!response.ok) {
                throw new Error('Failed to update card order');
            }
        } catch (error) {
            console.error('Error updating card order:', error);
        }
    };

    if (!isLoaded || isLoading) {
        return null;
    }

    return (
        <DataContext.Provider value={{
            cards,
            layout,
            addCard,
            updateCard,
            deleteCard,
            updateLayout,
            reorderCards,
            isGuest: !user
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
