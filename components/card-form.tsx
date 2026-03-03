'use client';

import { useState, useEffect } from 'react';
import { CardData, GalleryCardData, FrameworkCardData, PrincipleCardData } from '@/lib/mock-data';
import { useAuth } from '@/components/auth/auth-provider';
import { ImageUpload } from '@/components/image-upload';

interface CardFormProps {
    initialData?: Partial<CardData> | null;
    type?: 'gallery' | 'framework' | 'principle'; // Only for new cards
    onSubmit: (data: CardData) => void;
    onCancel: () => void;
}

export default function CardForm({ initialData, type, onSubmit, onCancel }: CardFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<Partial<CardData>>({});
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    // Open in edit mode if: no initialData OR initialData exists but has no id (new card with prefilled data)
    const [isEditing, setIsEditing] = useState(!initialData || !('id' in initialData));
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null); // Changed to track specific index
    // Use string to track which specific field was copied
    const [copiedField, setCopiedField] = useState<string | null>(null);
    // 图片上传状态
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleCopy = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Helper to append to comma-separated string
    const appendValue = (current: string, next: string) => {
        if (!current) return next;
        const parts = current.split(',').map(s => s.trim());
        if (parts.includes(next)) return current;
        return [...parts, next].join(', ');
    };

    useEffect(() => {
        if (initialData) {
            setFormData(JSON.parse(JSON.stringify(initialData)));
        } else {
            // Default initial state for new cards
            const baseType = type || 'gallery';
            if (baseType === 'gallery') {
                setFormData({
                    type: 'gallery',
                    title: '',
                    description: '',
                    images: [],
                    tags: []
                });
            } else if (baseType === 'framework') {
                setFormData({
                    type: 'framework', // Keeping internal type as 'framework' to avoid breaking DB/card logic
                    title: '',
                    patternType: 'Structure', // Default to Structure
                    code: '',
                    layout: 'horizontal'
                });
            } else {
                setFormData({
                    type: 'principle',

                    words: '',
                    sentence: '',
                    prompt: '',
                    color: 'yellow'
                });
            }
        }
    }, [initialData, type]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Derived Title for Header - shows actual card title or type
    const getHeaderTitle = () => {
        // If we have a title, show it
        if ('title' in formData && formData.title) return formData.title;
        // Otherwise show type-based default
        if (formData.type === 'gallery') return 'New Image';
        if (formData.type === 'framework') return 'New Pattern';
        if (formData.type === 'principle') return (formData as PrincipleCardData).words || 'New Principle';
        return 'Card Details';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = formData as CardData;

        // Validation & Defaults
        if (data.type === 'gallery' && !data.title) {
            data.title = 'New Prompt'; // Default title if hidden
        }

        if (data.type === 'framework' && !data.title) return;
        if (data.type === 'principle' && !data.words) return;

        onSubmit(data);
    };

    // Helper function to parse and highlight inline text (bold, code)
    const highlightInline = (text: string): React.ReactNode => {
        if (!text) return null;

        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        // Match **bold** and `code` patterns
        const pattern = /(\*\*.*?\*\*|`.*?`)/g;
        let match;

        while ((match = pattern.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            const matched = match[0];
            if (matched.startsWith('**') && matched.endsWith('**')) {
                // Bold text with yellow highlight
                parts.push(
                    <strong key={match.index} className="bg-yellow-100 px-1 font-semibold text-neutral-900">
                        {matched.slice(2, -2)}
                    </strong>
                );
            } else if (matched.startsWith('`') && matched.endsWith('`')) {
                // Code block
                parts.push(
                    <code key={match.index} className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono text-neutral-800">
                        {matched.slice(1, -1)}
                    </code>
                );
            }

            lastIndex = pattern.lastIndex;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return <>{parts}</>;
    };

    // Helper function to format prompt text with structure highlighting
    const formatPromptText = (text: string): React.ReactNode => {
        if (!text) return <span className="text-neutral-400 italic">No prompt provided</span>;

        const lines = text.split('\n');
        return lines.map((line, idx) => {
            // H1 - Single # heading (supports both "# Title" and "#Title")
            if (line.match(/^#[^#]/)) {
                const title = line.startsWith('# ') ? line.slice(2) : line.slice(1);
                return (
                    <h3 key={idx} className="text-lg font-extrabold text-neutral-900 mt-4 mb-2 first:mt-0">
                        {title}
                    </h3>
                );
            }

            // H2 - Double ## heading (supports both "## Title" and "##Title")
            if (line.startsWith('##')) {
                const title = line.startsWith('## ') ? line.slice(3) : line.slice(2);
                return (
                    <h4 key={idx} className="text-base font-bold text-neutral-800 mt-3 mb-1.5 first:mt-0">
                        {title}
                    </h4>
                );
            }

            // List item - starts with "-"
            if (line.trimStart().startsWith('- ')) {
                const indent = line.length - line.trimStart().length;
                return (
                    <div key={idx} className="flex gap-2 my-0.5" style={{ marginLeft: `${indent * 8}px` }}>
                        <span className="text-neutral-400 shrink-0">•</span>
                        <span className="text-neutral-700">{highlightInline(line.trimStart().slice(2))}</span>
                    </div>
                );
            }

            // Empty line - add spacing
            if (line.trim() === '') {
                return <div key={idx} className="h-2" />;
            }

            // Regular paragraph
            return (
                <p key={idx} className="my-1 text-neutral-700">
                    {highlightInline(line)}
                </p>
            );
        });
    };

    const renderGalleryFields = () => {
        const imageList = (formData as GalleryCardData).images || [];
        const currentModel = (formData as GalleryCardData).model || '';
        const currentTags = ((formData as GalleryCardData).tags || []).join(', ');
        const modelItems = currentModel.split(',').map((item) => item.trim()).filter(Boolean);
        const tagItems = (formData as GalleryCardData).tags || [];
        const currentSource = (formData as GalleryCardData).source || '';
        const currentSourceUrl = (formData as GalleryCardData).sourceUrl || '';

        return (
            <div className="flex flex-col gap-6">
                {/* Custom Header with Edit Button */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-2">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-xl font-bold text-neutral-900">{getHeaderTitle()}</h2>
                        {!isEditing && currentSource && (
                            <a
                                href={currentSourceUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xl font-bold text-neutral-300 hover:text-neutral-500 hover:underline transition-colors"
                            >
                                @{currentSource}
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
                            >
                                Save
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Image Lightbox Overlay */}
                {previewIndex !== null && imageList[previewIndex] && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                        {/* Close on backdrop click */}
                        <div className="absolute inset-0" onClick={() => setPreviewIndex(null)} />

                        <div className="relative max-w-[95vw] max-h-[95vh] flex flex-col items-center">
                            <img
                                src={imageList[previewIndex]}
                                alt="Full Preview"
                                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm"
                            />

                            {/* Actions Bar Removed for Lightbox - purely view now */}
                        </div>
                    </div>
                )}

                {/* Top Section: Image & Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Images */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            {imageList.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`relative h-24 sm:h-32 w-auto min-w-[5rem] bg-neutral-50 rounded-lg border border-neutral-200 overflow-hidden bg-white transition-all
                                        ${!isEditing ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : 'group'}
                                    `}
                                    onClick={() => !isEditing && setPreviewIndex(idx)}
                                >
                                    <img
                                        src={img}
                                        alt={`Preview ${idx}`}
                                        className="h-full w-auto object-contain"
                                    />

                                    {/* Edit Mode Deletion Overlay */}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (deleteConfirm === idx) {
                                                        const newImages = [...imageList];
                                                        newImages.splice(idx, 1);
                                                        handleChange('images', newImages);
                                                        setDeleteConfirm(null);
                                                    } else {
                                                        setDeleteConfirm(idx);
                                                    }
                                                }}
                                                onMouseLeave={() => setDeleteConfirm(null)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1 ${deleteConfirm === idx
                                                    ? 'bg-red-600 text-white scale-105'
                                                    : 'bg-white text-neutral-800 hover:bg-red-600 hover:text-white'
                                                    }`}
                                            >
                                                {deleteConfirm === idx ? 'Confirm' : 'Delete'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* Add Image Button - Only in Edit Mode */}
                            {isEditing && (
                                <div className="h-24 sm:h-32 w-24 sm:w-32">
                                    {user ? (
                                        // 登录用户: 使用 Supabase Storage 上传
                                        <label className="h-full w-full bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100 transition-all flex flex-col items-center justify-center cursor-pointer text-neutral-400 hover:text-neutral-600 gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                                            <span className="text-xs font-medium">Upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={uploadingImage}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    try {
                                                        setUploadingImage(true);
                                                        setUploadError(null);

                                                        // 动态导入上传函数
                                                        const { uploadPromptImage } = await import('@/lib/image-upload');
                                                        const imageUrl = await uploadPromptImage(file, user.id);

                                                        // 添加到图片列表
                                                        handleChange('images', [...imageList, imageUrl]);
                                                        e.target.value = ''; // 重置输入
                                                    } catch (error) {
                                                        const errorMsg = error instanceof Error ? error.message : '上传失败';
                                                        setUploadError(errorMsg);
                                                        console.error('图片上传失败:', error);
                                                    } finally {
                                                        setUploadingImage(false);
                                                    }
                                                }}
                                            />
                                        </label>
                                    ) : (
                                        // 游客模式: 使用 IndexedDB
                                        <label className="h-full w-full bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100 transition-all flex flex-col items-center justify-center cursor-pointer text-neutral-400 hover:text-neutral-600 gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                                            <span className="text-xs font-medium">Add Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={uploadingImage}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    // 创建 blob URL 用于表单内即时预览
                                                    const previewURL = URL.createObjectURL(file);

                                                    // 更新 images[]（展示用）和 imageFiles[]（持久化用）
                                                    const currentImages = (formData as GalleryCardData).images ?? [];
                                                    const currentFiles = (formData as GalleryCardData).imageFiles ?? [];
                                                    handleChange('images', [...currentImages, previewURL]);
                                                    handleChange('imageFiles', [...currentFiles, file]);
                                                    e.target.value = ''; // 重置输入
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* 上传状态提示 */}
                        {uploadingImage && (
                            <div className="text-xs text-neutral-500 flex items-center gap-2">
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                正在上传并压缩图片...
                            </div>
                        )}
                        {uploadError && (
                            <div className="text-xs text-red-600">
                                ❌ {uploadError}
                            </div>
                        )}
                        {/* URL Paste Fallback - Only in Edit Mode */}
                        {isEditing && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-xs text-neutral-500"
                                    placeholder="Paste image URL..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val) {
                                                handleChange('images', [...imageList, val]);
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Metadata */}
                    <div className="space-y-6 pt-2">
                        {/* Title Input - Only in Edit Mode */}
                        {isEditing && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                        value={(formData as GalleryCardData).title || ''}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        placeholder="Enter card title..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Source Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                            value={currentSource}
                                            onChange={(e) => handleChange('source', e.target.value)}
                                            placeholder="Source name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Source URL</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                            value={currentSourceUrl}
                                            onChange={(e) => handleChange('sourceUrl', e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Model & Tags Row - Chip-based Input */}
                        <div className="flex flex-col gap-4">
                            {/* Model Selection */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Model</label>
                                {isEditing ? (
                                    <div className={modelItems.length > 0 ? 'space-y-2' : ''}>
                                        {modelItems.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {modelItems.map((item, i) => (
                                                    <span key={i} className="group/chip inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold border border-neutral-200 hover:border-neutral-300 transition-colors">
                                                        {item.trim()}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const items = currentModel.split(',').map((entry) => entry.trim()).filter(Boolean);
                                                                items.splice(i, 1);
                                                                handleChange('model', items.join(', '));
                                                            }}
                                                            className="opacity-50 hover:opacity-100 hover:text-red-600 transition-all"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                            placeholder="Type and press Enter or comma to add..."
                                            onKeyDown={(e) => {
                                                const val = e.currentTarget.value.trim();
                                                if ((e.key === 'Enter' || e.key === ',') && val) {
                                                    e.preventDefault();
                                                    const current = currentModel ? currentModel + ', ' + val : val;
                                                    handleChange('model', current);
                                                    e.currentTarget.value = '';
                                                } else if (e.key === ',' && !val) {
                                                    e.preventDefault(); // Prevent empty comma
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {modelItems.length > 0 ? (
                                            modelItems.map((item, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white text-neutral-800 rounded-sm text-xs font-semibold border border-neutral-200 shadow-sm">
                                                    {item.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-neutral-300 italic text-sm">-</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Tags Selection */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Tags</label>
                                {isEditing ? (
                                    <div className={tagItems.length > 0 ? 'space-y-2' : ''}>
                                        {tagItems.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {tagItems.map((tag, i) => (
                                                    <span key={i} className="group/chip inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold border border-neutral-200 hover:border-neutral-300 transition-colors">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newTags = [...tagItems];
                                                                newTags.splice(i, 1);
                                                                handleChange('tags', newTags);
                                                            }}
                                                            className="opacity-50 hover:opacity-100 hover:text-red-600 transition-all"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                            placeholder="Type and press Enter or comma to add..."
                                            onKeyDown={(e) => {
                                                const val = e.currentTarget.value.trim();
                                                if ((e.key === 'Enter' || e.key === ',') && val) {
                                                    e.preventDefault();
                                                    const currentTags = (formData as GalleryCardData).tags || [];
                                                    handleChange('tags', [...currentTags, val]);
                                                    e.currentTarget.value = '';
                                                } else if (e.key === ',' && !val) {
                                                    e.preventDefault(); // Prevent empty comma
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {tagItems.length > 0 ? (
                                            tagItems.map((tag, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white text-neutral-800 rounded-sm text-xs font-semibold border border-neutral-200 shadow-sm">
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-neutral-300 italic text-sm">-</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Prompt */}
                <div className="border-t border-neutral-100 pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Prompt</label>
                        {/* Edit Mode Copy button logic could go here if needed, but sticking to view mode focus */}
                    </div>
                    <div className="relative group">
                        {isEditing ? (
                            <textarea
                                className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all min-h-[200px] resize-y"
                                value={(formData as GalleryCardData).description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="# Role\nYou are a creative assistant...\n\n# Task\nGenerate an image..."
                            />
                        ) : (
                            <div className="relative w-full p-6 bg-neutral-100 border border-neutral-200 rounded-xl text-sm leading-relaxed min-h-[200px] text-neutral-700">
                                {formatPromptText((formData as GalleryCardData).description || '')}

                                {/* Floating Copy Button */}
                                <button
                                    type="button"
                                    onClick={() => handleCopy((formData as GalleryCardData).description || '', 'gallery-desc')}
                                    className="absolute top-4 right-4 p-2 bg-white hover:bg-neutral-50 text-neutral-600 rounded-lg shadow-sm transition-all border border-neutral-200 opacity-0 group-hover:opacity-100 flex items-center gap-2"
                                    title="Copy to clipboard"
                                >
                                    {copiedField === 'gallery-desc' ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12" /></svg>
                                            <span className="text-xs font-bold text-green-500">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" ry="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>
                                            <span className="text-xs font-medium">Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderFrameworkFields = () => {
        const currentCode = (formData as FrameworkCardData).code || '';
        const currentSource = (formData as FrameworkCardData).source || '';
        const currentSourceUrl = (formData as FrameworkCardData).sourceUrl || '';
        const currentExample = (formData as FrameworkCardData).example || '';
        const currentExplanation = (formData as FrameworkCardData).explanation || '';

        return (
            <div className="flex flex-col gap-6 h-full">
                {/* Custom Header with Edit Button */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-2 shrink-0">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-xl font-bold text-neutral-900">{getHeaderTitle()}</h2>
                        {!isEditing && currentSource && (
                            <a
                                href={currentSourceUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xl font-bold text-neutral-300 hover:text-neutral-500 hover:underline transition-colors"
                            >
                                @{currentSource}
                            </a>
                        )}
                        {!isEditing && (formData as FrameworkCardData).patternType && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full border border-neutral-200 ml-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span className="text-xs font-bold uppercase text-neutral-600 tracking-wide">{(formData as FrameworkCardData).patternType}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
                            >
                                Save
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Edit Mode: Single Column Stack */}
                {/* View Mode: Two Column Grid */}
                {/* Metadata Section - Full Width, Only in Edit Mode */}
                {isEditing && (
                    <div className="space-y-4 mb-6 pb-6 border-b border-neutral-100 shrink-0">
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Title</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                value={(formData as FrameworkCardData).title || ''}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="Enter pattern title..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Source Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                    value={currentSource}
                                    onChange={(e) => handleChange('source', e.target.value)}
                                    placeholder="Source name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Source URL</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                    value={currentSourceUrl}
                                    onChange={(e) => handleChange('sourceUrl', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Card Layout</label>
                            <div className="flex bg-neutral-100 p-1 rounded-lg w-fit">
                                <button
                                    type="button"
                                    onClick={() => handleChange('layout', 'horizontal')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${(formData as FrameworkCardData).layout === 'horizontal'
                                        ? 'bg-white text-neutral-900 shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    Horizontal (Wide)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleChange('layout', 'vertical')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${((formData as FrameworkCardData).layout || 'vertical') === 'vertical'
                                        ? 'bg-white text-neutral-900 shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    Vertical (Tall)
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Explanation</label>
                            <textarea
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all min-h-[60px] resize-y"
                                value={currentExplanation}
                                onChange={(e) => handleChange('explanation', e.target.value)}
                                placeholder="Brief explanation of the pattern..."
                            />
                        </div>
                        {/* Pattern Category Selection */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Pattern Category</label>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    {['Structure', 'Skill'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleChange('patternType', type)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-all ${(formData as FrameworkCardData).patternType === type
                                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                    value={(formData as FrameworkCardData).patternType || ''}
                                    onChange={(e) => handleChange('patternType', e.target.value)}
                                    placeholder="Or type custom category..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* View Mode Explanation (Styled like Principle Sentence) */}
                {!isEditing && currentExplanation && (
                    <div className="shrink-0 mb-4">
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Explanation</label>
                        <div className="text-lg font-medium text-neutral-900 border-l-4 border-neutral-200 pl-4 py-1">
                            {currentExplanation}
                        </div>
                    </div>
                )}

                {/* Content Layout - Always Two Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full min-h-0">

                    {/* LEFT COLUMN: Content Inputs */}
                    <div className="flex flex-col gap-4 h-full min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between mb-2 shrink-0">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Structure</label>
                        </div>

                        <div className="relative group flex-grow min-h-0 flex flex-col">
                            {isEditing ? (
                                <textarea
                                    className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all min-h-[300px] resize-y"
                                    value={currentCode}
                                    onChange={(e) => handleChange('code', e.target.value)}
                                    placeholder="# Role\nYou are an expert...\n\n## Skills\n- Skill 1\n- Skill 2"
                                />
                            ) : (
                                <div className="relative w-full h-full p-6 bg-neutral-100 border border-neutral-200 rounded-xl text-sm leading-relaxed overflow-y-auto text-neutral-700">
                                    {formatPromptText(currentCode)}
                                    {/* Floating Copy Button for Code */}
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(currentCode, 'framework-code')}
                                        className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg shadow-sm transition-all border border-neutral-200 opacity-0 group-hover:opacity-100 flex items-center gap-2"
                                        title="Copy structure"
                                    >
                                        {copiedField === 'framework-code' ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12" /></svg>
                                                <span className="text-xs font-bold text-green-500">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" ry="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>
                                                <span className="text-xs font-medium">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Example */}
                    <div className="flex flex-col gap-4 h-full min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between mb-2 shrink-0">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Example</label>
                        </div>

                        <div className="relative group flex-grow min-h-0 flex flex-col">
                            {isEditing ? (
                                <textarea
                                    className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all min-h-[300px] resize-y"
                                    value={currentExample}
                                    onChange={(e) => handleChange('example', e.target.value)}
                                    placeholder="Provide a concrete example of this framework in action..."
                                />
                            ) : (
                                <div className="relative w-full h-full p-6 bg-white border border-dashed border-neutral-300 rounded-xl text-sm leading-relaxed overflow-y-auto text-neutral-700 shadow-sm">
                                    {currentExample ? formatPromptText(currentExample) : <span className="text-neutral-400 italic">No example provided</span>}

                                    {currentExample && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(currentExample, 'framework-example')}
                                            className="absolute top-4 right-4 p-2 bg-white hover:bg-neutral-50 text-neutral-600 rounded-lg shadow-sm transition-all border border-neutral-200 opacity-0 group-hover:opacity-100 flex items-center gap-2"
                                            title="Copy example"
                                        >
                                            {copiedField === 'framework-example' ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12" /></svg>
                                                    <span className="text-xs font-bold text-green-500">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" ry="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>
                                                    <span className="text-xs font-medium">Copy</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPrincipleFields = () => {
        const currentWords = (formData as PrincipleCardData).words || '';
        const currentSentence = (formData as PrincipleCardData).sentence || '';
        const currentExplanation = (formData as PrincipleCardData).explanation || '';
        const currentExample = (formData as PrincipleCardData).example || '';
        const currentPrompt = (formData as PrincipleCardData).prompt || '';
        const currentSource = (formData as PrincipleCardData).source || '';
        const currentSourceUrl = (formData as PrincipleCardData).sourceUrl || '';

        return (
            <div className="flex flex-col gap-6">
                {/* Custom Header with Edit Button */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-2">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-xl font-bold text-neutral-900">{getHeaderTitle()}</h2>
                        {!isEditing && currentSource && (
                            <a
                                href={currentSourceUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xl font-bold text-neutral-300 hover:text-neutral-500 hover:underline transition-colors"
                            >
                                @{currentSource}
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
                            >
                                Save
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Edit Mode Inputs */}
                {isEditing && (
                    <div className="space-y-4 mb-4">
                        {/* Words (Chinese) */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Words (Summary)</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                value={currentWords}
                                onChange={(e) => handleChange('words', e.target.value)}
                                placeholder="e.g. 具体明确"
                            />
                        </div>

                        {/* Sentence (English) */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Sentence (Slogan)</label>
                            <textarea
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all min-h-[60px] resize-y"
                                value={currentSentence}
                                onChange={(e) => handleChange('sentence', e.target.value)}
                                placeholder="e.g. Be specific about what you want..."
                            />
                        </div>

                        {/* Explanation (Explanation) */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Explanation (Interpretation)</label>
                            <textarea
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all min-h-[60px] resize-y"
                                value={currentExplanation}
                                onChange={(e) => handleChange('explanation', e.target.value)}
                                placeholder="Brief explanation of the principle..."
                            />
                        </div>

                        {/* Prompt (Concrete Example) */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Prompt</label>
                            <textarea
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all min-h-[100px] resize-y"
                                value={currentPrompt}
                                onChange={(e) => handleChange('prompt', e.target.value)}
                                placeholder="Specific prompt snippet..."
                            />
                        </div>

                        {/* Example (Abstract/Usage) */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Example</label>
                            <textarea
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all min-h-[80px] resize-y"
                                value={currentExample}
                                onChange={(e) => handleChange('example', e.target.value)}
                                placeholder="General example of how to apply this..."
                            />
                        </div>

                        {/* Source Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Source Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                    value={currentSource}
                                    onChange={(e) => handleChange('source', e.target.value)}
                                    placeholder="Source name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Source URL</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
                                    value={currentSourceUrl}
                                    onChange={(e) => handleChange('sourceUrl', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                )}
                {/* View Mode Content */}
                {!isEditing && (
                    <div className="space-y-6">
                        {/* Sentence */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Sentence</label>
                            <div className="text-lg font-medium text-neutral-900 border-l-4 border-neutral-200 pl-4 py-1">
                                {currentSentence || <span className="text-neutral-400 italic text-base">No sentence provided</span>}
                            </div>
                        </div>

                        {/* Explanation */}
                        {currentExplanation && (
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Explanation</label>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    {currentExplanation}
                                </p>
                            </div>
                        )}

                        {/* Two Columns: Prompt & Example */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Prompt */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Prompt</label>
                                {currentPrompt ? (
                                    <div className="relative p-4 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                        {currentPrompt}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-neutral-50 rounded-lg text-neutral-400 italic text-sm border border-neutral-200 flex items-center justify-center min-h-[100px]">
                                        No prompt provided
                                    </div>
                                )}
                            </div>

                            {/* Example */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Example</label>
                                {currentExample ? (
                                    <div className="p-4 bg-neutral-50 rounded-lg text-sm text-neutral-700 leading-relaxed border border-neutral-100 whitespace-pre-wrap">
                                        {currentExample}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-neutral-50 rounded-lg text-neutral-400 italic text-sm border border-neutral-100 flex items-center justify-center min-h-[100px]">
                                        No example provided
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}



            </div>
        );
    };

    const currentType = initialData ? initialData.type : type;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {currentType === 'gallery' && renderGalleryFields()}
            {currentType === 'framework' && renderFrameworkFields()}
            {currentType === 'principle' && renderPrincipleFields()}


        </form>
    );
}
