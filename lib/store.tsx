'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CardData, mockDashboardData } from './mock-data';

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
    addCard: (card: CardData) => void;
    updateCard: (card: CardData) => void;
    deleteCard: (id: string) => void;
    updateLayout: (newLayout: LayoutItem[]) => void;
    reorderCards: (newOrder: string[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [cards, setCards] = useState<CardData[]>([]);
    const [layout, setLayout] = useState<LayoutItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load from API on mount
    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch('/api/cards');
                if (!response.ok) {
                    throw new Error('Failed to fetch cards');
                }
                const data = await response.json();
                const fetchedCards = data.cards || [];

                setCards(fetchedCards);
                setLayout(generateDefaultLayout(fetchedCards));
                setIsLoaded(true);
            } catch (error) {
                console.error('Error loading cards:', error);
                // Fallback to mock data if API fails
                setCards(mockDashboardData);
                setLayout(generateDefaultLayout(mockDashboardData));
                setIsLoaded(true);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

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

    const addCard = async (card: CardData) => {
        const newCard = { ...card, id: Date.now().toString() };

        // Optimistic update
        setCards(prev => [newCard, ...prev]);

        const w = newCard.type === 'gallery' ? 2 : newCard.type === 'framework' && newCard.layout === 'horizontal' ? 2 : 1;
        const h = newCard.type === 'gallery' ? 2 : newCard.type === 'framework' && newCard.layout === 'vertical' ? 2 : 1;
        setLayout(prev => [{ i: newCard.id, x: 0, y: 0, w, h }, ...prev]);

        try {
            const response = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCard)
            });

            if (!response.ok) {
                throw new Error('Failed to create card');
            }
        } catch (error) {
            console.error('Error creating card:', error);
            // Revert optimistic update on failure
            setCards(prev => prev.filter(c => c.id !== newCard.id));
            setLayout(prev => prev.filter(item => item.i !== newCard.id));
        }
    };

    const updateCard = async (card: CardData) => {
        // Optimistic update
        setCards(prev => prev.map(c => c.id === card.id ? card : c));

        try {
            const response = await fetch(`/api/cards/${card.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(card)
            });

            if (!response.ok) {
                throw new Error('Failed to update card');
            }
        } catch (error) {
            console.error('Error updating card:', error);
            // In production, you might want to reload the card from the server
        }
    };

    const deleteCard = async (id: string) => {
        // Optimistic update
        const cardToDelete = cards.find(c => c.id === id);
        setCards(prev => prev.filter(c => c.id !== id));
        setLayout(prev => prev.filter(item => item.i !== id));

        try {
            const response = await fetch(`/api/cards/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete card');
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
        <DataContext.Provider value={{ cards, layout, addCard, updateCard, deleteCard, updateLayout, reorderCards }}>
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
