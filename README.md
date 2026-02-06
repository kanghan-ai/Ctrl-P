# Ctrl+P - AI Prompt Manager

> **Don't just paste. Structure it.**

一个优雅的 AI 提示词管理工具，帮助你像管理代码一样管理提示词。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ 核心理念

在 AI 时代，提示词是我们最强大的工具。但我们却像对待便签纸一样随意管理它们——到处复制粘贴，丢失上下文，无法复用。

**Ctrl+P** 将提示词视为代码，提供结构化的管理方式：

- 📸 **Image Prompts** - 图像生成提示词，带标签和模型信息
- 📝 **Frameworks** - 可复用的提示词模板（如 LangGPT、Chain-of-Thought）
- � **Principles** - 提示词工程的核心原则和最佳实践

---

## 🎯 功能特性

### 📊 Bento Grid 布局
- 灵活的卡片网格系统
- 不同类型卡片自适应大小（1x1、2x1、2x2）
- 响应式设计，完美适配各种屏幕

### 🎨 拖拽排序
- 基于 `@dnd-kit` 的流畅拖拽体验
- 拖出边界即可删除卡片
- 锁定模式防止误操作
- `Ctrl+S` 保存布局

### 📋 全局粘贴
- **粘贴图片** → 自动创建 Image Prompt
- **粘贴文本** → 自动创建 Framework
- 无需点击按钮，即刻开始

### 🎭 美观设计
- Minimalist 美学
- Framer Motion 动画
- 自适应暗色模式
- 自定义 Logo 和 Favicon

---

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| **Next.js 14** | App Router + Server Components |
| **React 18** | UI 框架 |
| **TypeScript** | 类型安全 |
| **Tailwind CSS** | 样式系统 |
| **Framer Motion** | 动画引擎 |
| **@dnd-kit** | 拖拽交互 |
| **Lucide React** | 图标库 |

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm run start
```

---

## 📁 项目结构

```
Ctrl+P/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页 (Landing)
│   ├── story/             # 产品故事页
│   ├── dashboard/         # 主应用 Dashboard
│   ├── api/cards/         # REST API
│   ├── icon.tsx           # 动态 Favicon
│   └── layout.tsx         # 根布局
│
├── components/
│   ├── cards/             # 卡片组件
│   │   ├── gallery-card.tsx
│   │   ├── framework-card.tsx
│   │   └── principle-card.tsx
│   ├── ui/                # 通用 UI 组件
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   └── logo.tsx
│   ├── card-form.tsx      # 卡片编辑表单
│   ├── hero-section.tsx   # 首页 Hero 区域
│   ├── hero-background.tsx
│   └── magical-editor.tsx # 动画演示组件
│
├── lib/
│   ├── store.tsx          # React Context 状态管理
│   ├── mock-data.ts       # 数据类型定义
│   └── utils.ts           # 工具函数
│
└── data/
    └── cards.json         # 用户数据存储
```

---

## � 使用指南

### 1. 添加 Prompt

**方式一：全局粘贴**
- 复制图片 → 在 Dashboard 任意位置粘贴
- 复制文本 → 在 Dashboard 任意位置粘贴

**方式二：手动创建**
- 点击右上角 `+ Add New`
- 选择类型：Image Prompt / Framework / Principle

### 2. 编辑 Prompt

- 点击卡片右上角 `✏️` 图标
- 在弹出的模态框中编辑
- 保存或取消

### 3. 排序布局

- **拖拽卡片** 调整位置
- **Ctrl+S** 保存当前布局
- 点击 **锁定按钮** 进入只读模式

### 4. 删除 Prompt

- **方式一**：拖拽卡片至屏幕边界外
- **方式二**：编辑时点击删除按钮

---

## 🗂 数据类型

### Gallery (Image Prompt)
```typescript
{
  type: 'gallery',
  id: string,
  images: string[],        // Base64 或 URL
  title: string,
  description: string,     // Markdown 格式
  tags: string[],
  model?: string,          // AI 模型名称
  source?: string,
  sourceUrl?: string
}
```

### Framework (文本模板)
```typescript
{
  type: 'framework',
  id: string,
  title: string,
  frameworkName: string,   // 如 "LangGPT"
  code: string,            // Markdown 格式模板
  layout?: 'vertical' | 'horizontal',
  source?: string,
  sourceUrl?: string,
  example?: string
}
```

### Principle (原则)
```typescript
{
  type: 'principle',
  id: string,
  words: string,           // 中文短句
  sentence: string,        // 英文描述
  explanation?: string,
  example?: string,
  prompt?: string,
  source?: string,
  sourceUrl?: string,
  color: 'yellow' | 'cyan' | 'magenta'
}
```

---

## � API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/cards` | 获取所有卡片 |
| `POST` | `/api/cards` | 创建新卡片 |
| `PUT` | `/api/cards` | 批量更新（用于排序） |
| `PUT` | `/api/cards/[id]` | 更新单个卡片 |
| `DELETE` | `/api/cards/[id]` | 删除卡片 |

---

## 🎨 设计系统

### 颜色
- **主色调**: `#000000` (黑)
- **背景**: `#F4F4F4` (浅灰)
- **强调色**: `#FACC15` (黄色，用于 Prompt 高亮)

### 字体
- **英文**: Inter、Nunito
- **中文**: Lora、Comfortaa

---

## 🚧 路线图

- [ ] 本地存储 (LocalStorage / IndexedDB)
- [ ] 导出/导入功能 (JSON 备份)
- [ ] 图片压缩
- [ ] 多用户支持 (Supabase + 认证)
- [ ] 搜索和过滤
- [ ] 标签管理
- [ ] 暗色模式切换

---

## 📄 License

MIT © 2026 Kang Han

---

## � 致谢

灵感来源于对更好的 Prompt 管理工具的渴望。感谢所有提供 Prompt Engineering 最佳实践的社区。

**Built with ❤️ by a CS Senior passionate about AI.**
