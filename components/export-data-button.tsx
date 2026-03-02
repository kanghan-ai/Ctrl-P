'use client';

import { useState } from 'react';
import { useData } from '@/lib/store';
import { Download, Copy, Terminal } from 'lucide-react';
import { exportCardsToJSON, copyCardsToClipboard, printCardsToConsole } from '@/lib/export-data';

export default function ExportDataButton() {
    const { cards } = useData();
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleExportJSON = () => {
        exportCardsToJSON(cards, 'preset-cards.json');
        setShowMenu(false);
    };

    const handleCopyToClipboard = async () => {
        const success = await copyCardsToClipboard(cards);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        setShowMenu(false);
    };

    const handlePrintToConsole = () => {
        printCardsToConsole(cards);
        setShowMenu(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="group flex items-center gap-2 px-4 py-2 bg-white text-neutral-600 border border-neutral-200 rounded-full hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 transition-all shadow-sm text-sm font-medium"
            >
                <Download className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                <span>导出数据</span>
            </button>

            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* 菜单 */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-20">
                        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                            <p className="text-xs font-medium text-neutral-500">
                                导出 {cards.length} 张卡片
                            </p>
                        </div>

                        <button
                            onClick={handleExportJSON}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-b border-neutral-50"
                        >
                            <Download className="w-4 h-4" />
                            下载 JSON 文件
                        </button>

                        <button
                            onClick={handleCopyToClipboard}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-b border-neutral-50"
                        >
                            <Copy className="w-4 h-4" />
                            {copied ? '已复制!' : '复制到剪贴板'}
                        </button>

                        <button
                            onClick={handlePrintToConsole}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                            <Terminal className="w-4 h-4" />
                            打印到控制台
                        </button>

                        <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                            <p className="text-xs text-blue-700 leading-relaxed">
                                💡 在界面上创建预设卡片后,使用此功能导出数据
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
