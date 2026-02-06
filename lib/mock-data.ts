export interface GalleryCardData {
    type: 'gallery';
    id: string;
    images: string[];
    title: string;
    description: string;
    tags: string[];
    model?: string;
    source?: string;
    sourceUrl?: string;
}

export interface FrameworkCardData {
    type: 'framework';
    id: string;
    title: string;
    frameworkName: string;
    code: string;
    layout?: 'vertical' | 'horizontal';
    source?: string;       // 来源名称
    sourceUrl?: string;    // 来源链接
    example?: string;      // 示例内容
}

export interface PrincipleCardData {
    type: 'principle';
    id: string;
    words: string;           // 中文短句 (e.g. "具体明确")
    sentence: string;        // 英文长句 (e.g. "Be specific in your instructions")
    explanation?: string;    // 一句话解释
    example?: string;        // 示例
    prompt?: string;         // 可选的 Prompt 示例
    source?: string;         // 来源名称
    sourceUrl?: string;      // 来源链接
    color: 'yellow' | 'cyan' | 'magenta';
}

export type CardData = GalleryCardData | FrameworkCardData | PrincipleCardData;

export const mockGalleryData: GalleryCardData[] = [
    {
        type: 'gallery',
        id: 'g1',
        images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23000" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24" fill="%23fff"%3EDragon Concept%3C/text%3E%3C/svg%3E'],
        title: 'Cyber Dragon',
        description: `# Role: 赛博龙设计师
## Profile
- Language: 中文
- Description: 专注于**未来主义**和**新粗野主义**风格的AI图像设计专家

## Task
创建一个具有几何图案的赛博龙形象，融合科技感与神秘感。使用\`Midjourney v6\`生成高质量图像。

## Requirements
- 使用**锐利的棱角**和几何形状
- 添加**霓虹色调**（青色、品红色）
- 保持极简主义美学
- 融入电路板纹理元素

## Style Keywords
- Neo-brutalist
- Geometric patterns
- Sharp angular lines
- Cyberpunk aesthetic`,
        tags: ['Dragon', 'Geometric', 'Cyber'],
        model: 'Nano-Banana',
    },
    {
        type: 'gallery',
        id: 'g2',
        images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23fff" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24" fill="%23000"%3EMinimal Rose%3C/text%3E%3C/svg%3E'],
        title: 'Abstract Rose',
        description: 'Minimalist rose design with bold black outlines and stark contrast.',
        tags: ['Rose', 'Minimal', 'Bold'],
        model: 'Stable-Diffusion-XL',
    },
];

export const mockFrameworkData: FrameworkCardData[] = [
    {
        type: 'framework',
        id: 'f1',
        title: 'LangGPT Framework',
        frameworkName: 'LangGPT',
        code: `# Role: 专家角色
## Profile
- Author: User
- Language: 中文
- Description: 具体描述

## Skills
- 技能1
- 技能2

## Rules
- 规则1
- 规则2`,
        layout: 'vertical',
        source: 'LangGPT Project',
        sourceUrl: 'https://github.com/langgptai/LangGPT',
        example: `# Role: 翻译官
## Profile
- Author: User
- Language: 中文
- Description: 擅长将英文技术文档翻译成流畅的中文

## Skills
- 精通计算机术语
- 熟悉技术写作规范

## Rules
- 保持原意
- 术语准确`
    },
    {
        type: 'framework',
        id: 'f2',
        title: 'OpenAI Prompt Pattern',
        frameworkName: 'Chain-of-Thought',
        code: `Let's think step by step:
1. First, analyze...
2. Then, consider...
3. Finally, conclude...`,
        layout: 'horizontal',
        source: 'OpenAI',
        sourceUrl: 'https://platform.openai.com/docs/guides/prompt-engineering',
        example: `Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?
A: Let's think step by step.
1. Roger starts with 5 balls.
2. 2 cans * 3 balls/can = 6 balls.
3. 5 + 6 = 11 balls.
Answer: 11`
    },
];

export const mockPrincipleData: PrincipleCardData[] = [
    {
        type: 'principle',
        id: 'p1',
        words: '具体明确',
        sentence: 'Be specific about what you want the model to do.',
        prompt: 'Instead of "Write a story", try "Write a 500-word sci-fi story about a time traveler who gets stuck in 1999".',
        source: 'Prompt Engineering Guide',
        sourceUrl: 'https://www.promptingguide.ai/',
        color: 'yellow',
    },
    {
        type: 'principle',
        id: 'p2',
        words: '提供上下文',
        sentence: 'Provide sufficient context for the model to understand the task.',
        prompt: 'Context: I am a software engineer applying for a senior role.\nTask: Rewrite this resume summary to highlight leadership experience.',
        source: 'OpenAI Best Practices',
        sourceUrl: 'https://platform.openai.com/docs/guides/prompt-engineering',
        color: 'cyan',
    },
    {
        type: 'principle',
        id: 'p3',
        words: '持续迭代',
        sentence: 'Iterate on your prompts based on the outputs you receive.',
        source: 'Anthropic Claude Guide',
        sourceUrl: 'https://docs.anthropic.com/claude/docs/prompt-engineering',
        color: 'magenta',
    },
];

export const mockDashboardData: CardData[] = [
    mockGalleryData[0],
    mockFrameworkData[0],
    mockPrincipleData[0],
    mockGalleryData[1],
    mockPrincipleData[1],
    mockFrameworkData[1],
    mockPrincipleData[2],
];
