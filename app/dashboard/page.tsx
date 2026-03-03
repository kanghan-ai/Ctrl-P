'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Lock, Unlock } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GalleryCard from '@/components/cards/gallery-card';
import FrameworkCard from '@/components/cards/framework-card';
import PrincipleCard from '@/components/cards/principle-card';
import { DataProvider, useData } from '@/lib/store';
import Modal from '@/components/ui/modal';
import CardForm from '@/components/card-form';
import Logo from '@/components/ui/logo';
import { CardData } from '@/lib/mock-data';
import UserMenu from '@/components/auth/user-menu';
import { useAuth } from '@/components/auth/auth-provider';
import WelcomeToast from '@/components/onboarding/welcome-toast';
import HintBar from '@/components/onboarding/hint-bar';
import GuestDataMigration from '@/components/guest-data-migration';
import ExportDataButton from '@/components/export-data-button';
import { loadSampleData, isFirstTimeUser } from '@/lib/onboarding-helpers';

// Wrapper component to provide context
export default function DashboardPage() {
    return (
        <DataProvider>
            <DashboardContent />
        </DataProvider>
    );
}

// Sortable Card Wrapper
function DragEdgeOverlay({ active }: { active: boolean }) {
    return (
        <div
            className={`fixed inset-0 z-40 pointer-events-none border-[4px] border-dashed border-neutral-300 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
        />
    );
}

// Sortable Card Wrapper
function SortableCard({ card, onEdit, onDelete, isLocked }: { card: CardData; onEdit: (id: string) => void; onDelete: (id: string) => void, isLocked: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getGridClass = () => {
        if (card.type === 'gallery') return 'col-span-2 row-span-2';
        if (card.type === 'framework' && card.layout === 'horizontal') return 'col-span-2 row-span-1';
        if (card.type === 'framework') return 'col-span-1 row-span-2';
        return 'col-span-1 row-span-1';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(!isLocked ? listeners : {})}
            className={`${getGridClass()} group relative ${isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        >
            {card.type === 'gallery' && <GalleryCard data={card} onEdit={onEdit} />}
            {card.type === 'framework' && <FrameworkCard data={card} onEdit={onEdit} />}
            {card.type === 'principle' && <PrincipleCard data={card} onEdit={onEdit} />}
        </div>
    );
}

function DashboardContent() {
    const { cards, addCard, updateCard, deleteCard, reorderCards } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<Partial<CardData> | null>(null);
    const [newCardType, setNewCardType] = useState<'gallery' | 'framework' | 'principle'>('gallery');
    const [cardOrder, setCardOrder] = useState<string[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initialize card order (sync only if order mismatches significantly or first load)
    useEffect(() => {
        // Only update local order if lengths mismatch or it's a new card addition
        // We generally trust local state for order unless server/store pushes a structural change
        if (cards.length !== cardOrder.length) {
            setCardOrder(cards.map(c => c.id));
        }
    }, [cards, cardOrder.length]); // Depend on length to avoid infinite reset loops

    // Load sample data for first-time users
    useEffect(() => {
        const loadInitialData = async () => {
            // 只在首次访问且没有卡片时加载示例数据
            if (isFirstTimeUser() && cards.length === 0) {
                try {
                    const sampleCards = await loadSampleData();
                    // 这里原本采用循环 addCard 的方式，会导致状态更新混乱且产生多个 localStorage 写入
                    // 改为在 store 中提供一种机制，或者由于是首次加载，我们可以利用 useData 的初始化逻辑
                    // 实际上 store.tsx 的 loadData 已经包含了初始化逻辑，这里的 loadInitialData 可能是冗余的
                    // 或者我们应该在 store.tsx 中确保 loadData 逻辑足够健壮

                    // 标记用户已访问过
                    localStorage.setItem('has_visited', 'true');
                    // 强制刷新或重新触发 store 加载（如果需要）
                } catch (error) {
                    console.error('Failed to load sample data:', error);
                }
            }
        };

        loadInitialData();
    }, [cards.length]); // 监听 cards.length 变化

    // Save Shortcut Listener (Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                // Save current visual order to store
                reorderCards(cardOrder);

                // Add a subtle visual feedback
                const header = document.querySelector('header');
                if (header) {
                    header.style.transition = 'border-color 0.2s';
                    const originalBorder = header.style.borderColor;
                    header.style.borderColor = '#10b981'; // Green
                    setTimeout(() => {
                        header.style.borderColor = originalBorder;
                    }, 500);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cardOrder, reorderCards]);

    const handleEdit = (id: string) => {
        const card = cards.find(c => c.id === id);
        if (card) {
            setEditingCard(card);
            setIsModalOpen(true);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteCard(deleteId);
            setDeleteId(null);
        }
    };

    const handleCreate = (type: 'gallery' | 'framework' | 'principle', prefillData?: Partial<CardData>) => {
        setNewCardType(type);
        setEditingCard(prefillData ? { ...prefillData, type } as unknown as CardData : null);
        setIsModalOpen(true);
    };

    // Global Paste Handler
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                isModalOpen ||
                deleteId
            ) {
                return;
            }

            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            handleCreate('gallery', { images: [base64], title: 'New Image Prompt' });
                        };
                        reader.readAsDataURL(blob);
                        e.preventDefault();
                        return;
                    }
                }

                if (item.type.indexOf('text/plain') !== -1) {
                    item.getAsString((text) => {
                        if (text.trim()) {
                            handleCreate('framework', {
                                code: text,
                                title: 'New Framework',
                                patternType: 'Snippet'
                            });
                        }
                    });
                    e.preventDefault();
                    return;
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [isModalOpen, deleteId]);

    const handleSubmit = (data: CardData) => {
        if (editingCard && editingCard.id) {
            updateCard({ ...data, id: editingCard.id });
        } else {
            addCard(data);
        }
        setIsModalOpen(false);
    };

    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (event: DragStartEvent) => {
        setIsDragging(true);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setIsDragging(false);
        const { active, over } = event;

        // Check for out of bounds deletion
        if (active.rect.current.translated) {
            const { top, left, width, height } = active.rect.current.translated;
            const centerX = left + width / 2;
            const centerY = top + height / 2;

            // Define viewport bounds
            // Using a small buffer (e.g., 0) means exact edge. 
            // User said "halfway out" -> center point out of bounds.
            const isOutside =
                centerX < 0 ||
                centerX > window.innerWidth ||
                centerY < 0 ||
                centerY > window.innerHeight;

            if (isOutside) {
                setDeleteId(active.id as string);
                return;
            }
        }

        if (over && active.id !== over.id) {
            setCardOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Get sorted cards based on cardOrder
    const sortedCards = cardOrder
        .map(id => cards.find(c => c.id === id))
        .filter((card): card is CardData => card !== undefined);

    return (
        <>
            {/* Onboarding Components */}
            <HintBar />

            {/* 数据迁移对话框 */}
            <GuestDataMigration />

            <main className="min-h-screen bg-[#F4F4F4] p-4 md:p-8 font-sans overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.header
                        className="mb-12 flex items-center justify-between border-b border-neutral-200 pb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Left Section: User Info */}
                        <UserMenu />

                        {/* Right Action Section */}
                        <div className="flex items-center gap-4">
                            {/* 数据导出按钮已移至头像菜单 */}

                            <button
                                data-guide="lock-button"
                                onClick={() => setIsLocked(!isLocked)}
                                className={`p-2.5 rounded-full transition-all ${isLocked ? 'bg-amber-100 text-amber-600' : 'bg-white text-neutral-400 hover:text-black hover:bg-neutral-100'}`}
                            >
                                {isLocked ? (
                                    <Lock className="w-5 h-5" />
                                ) : (
                                    <Unlock className="w-5 h-5" />
                                )}
                            </button>

                            <div className="group relative" data-guide="add-new-button">
                                <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all shadow-md hover:shadow-lg active:scale-95">
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                                <div className="absolute right-0 top-full pt-2 w-40 hidden group-hover:block z-20">
                                    <div className="bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden">
                                        <button
                                            onClick={() => handleCreate('gallery')}
                                            className="w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors border-b border-neutral-50"
                                        >
                                            Image Prompt
                                        </button>
                                        <button
                                            onClick={() => handleCreate('framework')}
                                            className="w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors border-b border-neutral-50"
                                        >
                                            Framework
                                        </button>
                                        <button
                                            onClick={() => handleCreate('principle')}
                                            className="w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                                        >
                                            Principle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.header>

                    {/* Drag Visual Cue */}
                    <DragEdgeOverlay active={isDragging} />

                    {/* Bento Grid with Drag and Drop */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        autoScroll={false}
                    >
                        <SortableContext
                            items={cardOrder}
                            strategy={rectSortingStrategy}
                            disabled={isLocked}
                        >
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-auto"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                {/* Draggable Cards */}
                                {sortedCards.map((card) => (
                                    <SortableCard
                                        key={card.id}
                                        card={card}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                        isLocked={isLocked}
                                    />
                                ))}
                            </motion.div>
                        </SortableContext>
                    </DndContext>

                    {/* Footer */}
                    <motion.footer
                        className="mt-20 text-center pb-8 border-t border-neutral-200/50 pt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <p className="text-sm text-neutral-400">
                            Ctrl+P &copy; 2026. Clean & Structured.
                        </p>
                    </motion.footer>

                    {/* Edit/Create Modal */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={
                            editingCard && 'title' in editingCard && editingCard.title
                                ? editingCard.title
                                : `New ${newCardType === 'gallery' ? 'Image Prompt' : newCardType === 'framework' ? 'Framework' : 'Principle'}`
                        }
                        maxWidth={
                            (editingCard?.type === 'gallery' || editingCard?.type === 'framework' || (!editingCard && (newCardType === 'gallery' || newCardType === 'framework')))
                                ? 'max-w-5xl'
                                : 'max-w-4xl'
                        }
                        hideHeader={true}
                    >
                        <CardForm
                            initialData={editingCard}
                            type={newCardType}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </Modal>

                    {/* Delete Confirmation Modal */}
                    <Modal
                        isOpen={!!deleteId}
                        onClose={() => setDeleteId(null)}
                        title="Delete Card"
                    >
                        <div className="space-y-4">
                            <p className="text-neutral-600">
                                Are you sure you want to delete this card? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </main>
        </>
    );
}
