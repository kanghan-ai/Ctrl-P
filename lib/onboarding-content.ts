// 展示型引导步骤定义
export interface GuideStep {
    id: number;
    icon: string;
    title: string;
    description: string;
    details?: string[]; // 详细说明
    tip?: string; // 提示
    media?: {
        type: 'gif' | 'video' | 'image';
        src: string; // 媒体文件路径
        alt: string; // 替代文本
    };
}

export const guideSteps: GuideStep[] = [
    {
        id: 1,
        icon: '🎉',
        title: '欢迎使用 CTRL+P',
        description: '你的个人 AI Prompt 管理系统',
        details: [
            '快速导入和管理你的提示词',
            '支持三种类型的内容卡片',
            '灵活的布局和强大的搜索功能'
        ]
    },
    {
        id: 2,
        icon: '📸',
        title: 'Image 卡片',
        description: '按 Ctrl+V 粘贴带图片的内容，自动创建图片卡片',
        details: [
            '📝 标题 - 提示词名称',
            '🖼️ 图片 - 参考图或生成结果',
            '📋 Prompt - 完整提示词',
            '🏷️ 标签 - 分类标签',
            '🤖 模型 - AI 模型名称'
        ],
        tip: '支持从 Midjourney、DALL-E 等平台直接复制',
        media: {
            type: 'gif',
            src: '/guide/paste-image-prompt.gif',
            alt: '粘贴图片提示词演示'
        }
    },
    {
        id: 3,
        icon: '📝',
        title: 'Patterns 卡片',
        description: '按 Ctrl+V 粘贴纯文本，自动创建模式卡片',
        details: [
            '📝 标题 - 模式名称',
            '💻 代码 - Prompt 模板',
            '📚 模式类型 - 如 Structure、Skill 等'
        ],
        tip: '适合保存可重复使用的 Prompt 模式',
        media: {
            type: 'gif',
            src: '/guide/paste-framework.gif', // Keeping media name same for now unless file renamed
            alt: '粘贴模式演示'
        }
    },
    {
        id: 4,
        icon: '💡',
        title: 'Principle 卡片',
        description: '点击 Add New → Principle 添加方法论卡片',
        details: [
            '✨ 核心词 - 简短的原则描述',
            '📖 详细说明 - 完整解释',
            '🔗 来源 - 资料来源（可选）',
            '🌐 链接 - 参考链接（可选）'
        ],
        tip: '用于记录 Prompt 工程的技巧和最佳实践',
        media: {
            type: 'gif',
            src: '/guide/add-principle.gif',
            alt: '添加 Principle 演示'
        }
    },
    {
        id: 5,
        icon: '🎨',
        title: '布局管理',
        description: '自由拖拽调整卡片位置，打造专属布局',
        details: [
            '🖱️ 拖拽 - 按住卡片拖动调整位置',
            '🗑️ 删除 - 拖到屏幕边缘即可删除',
            '🔒 锁定 - 点击锁定按钮进入只读模式',
            '💾 保存 - 按 Ctrl+S 保存当前布局'
        ],
        tip: '布局会自动保存到云端，下次打开保持不变',
        media: {
            type: 'gif',
            src: '/guide/drag-and-layout.gif',
            alt: '拖拽布局演示'
        }
    },
    {
        id: 6,
        icon: '✅',
        title: '开始使用',
        description: '现在试试粘贴你的第一个 Prompt 吧！',
        details: [
            '💡 支持全局粘贴，无需点击输入框',
            '☁️ 数据自动同步到云端',
            '🔍 点击卡片可查看和编辑详情',
            '📱 支持多设备访问'
        ]
    }
];

// 顶部提示栏专用的简短引导提示
export interface HintBarTip {
    id: number;
    icon: string; // lucide-react 图标名称
    title: string;
    content: string;
    kbd?: string; // 可选的快捷键提示
}

export const hintBarTips: HintBarTip[] = [
    {
        id: 1,
        icon: 'Lightbulb',
        title: '快速开始',
        content: '点击右上角 "Add New" 创建卡片，或直接按 {kbd} 粘贴内容',
        kbd: 'Ctrl+V'
    },
    {
        id: 2,
        icon: 'LayoutGrid',
        title: '卡片类型',
        content: '支持图片(Image)、模式(Patterns)、原则(Principle)三种卡片类型，满足不同需求'
    },
    {
        id: 3,
        icon: 'Move',
        title: '拖拽排序',
        content: '解锁后可自由拖拽卡片重新排列，按 {kbd} 保存布局',
        kbd: 'Ctrl+S'
    },
    {
        id: 4,
        icon: 'Edit',
        title: '编辑卡片',
        content: '点击卡片可查看详情、编辑内容和标签，轻松管理你的知识库'
    },
    {
        id: 5,
        icon: 'Lock',
        title: '锁定布局',
        content: '点击右上角锁图标可锁定/解锁布局，防止误操作'
    },
    {
        id: 6,
        icon: 'HelpCircle',
        title: '查看引导',
        content: '随时通过头像菜单的"查看引导"重新查看这些提示'
    }
];
