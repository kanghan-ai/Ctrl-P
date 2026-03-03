# ⌨️ Ctrl+P - AI Prompt 工作台

> **Don't just paste. Structure it.**
> 像管理代码一样，管理提示词。

[Live Demo →](https://ctrlp-ai.vercel.app)

---

## ✨ 核心理念

在 AI 时代，提示词（Prompt）是与机器沟通的核心源代码。Ctrl+P 重新定义了提示词的管理流程，将其结构化、模块化：

- **Image Prompts**：支持图片预览与 Base64/Storage 双存储，适配主流绘图模型。
- **Patterns**：将提示词拆解为 Structure、Skill 等可复用的逻辑组件。
- **Principles**：内置专家级提示词工程准则，提升指令精准度。

---

## 🎯 核心特性

- **高效工作流**：
  - **全局粘贴侦听**：在 Dashboard 直接粘贴文本或图片，系统自动识别并创建对应卡片。
  - **Bento Grid 布局**：基于网格的自由布局系统，支持卡片在网格中拖拽排序。
- **双模存储**：
  - **游客模式 (Viewer Mode)**：数据存储于浏览器 IndexedDB，隐私安全，无需登录。
  - **云端模式 (Account Mode)**：登录后支持将本地数据一键迁移至 Supabase 云端，实现多端同步。
- **视觉美学**：
  - 极简主义设计语言，配合 Framer Motion 动效交互。
  - 动态 Logo 与高度自定义的 Favicon 配置。
- **性能优化**：
  - 基于 Next.js 14 App Router 架构。
  - 集成浏览器端图片压缩（WebP），优化存储空间与加载速度。

---

## 🛠 技术栈

| 技术 | 用途 |
| :--- | :--- |
| **Next.js 14** | 核心框架 (App Router, Server Actions) |
| **Supabase** | 后端服务 (数据库, 云存储, 身份验证) |
| **IndexedDB** | 浏览器本地持久化存储 (游客模式) |
| **@dnd-kit** | 复杂拖拽交互系统 |
| **Framer Motion** | 交互动效与页面转换 |
| **Tailwind CSS** | 响应式样式与 UI 布局 |
| **Lucide React** | 语义化图标库 |

---

## 📁 项目结构

```text
.
├── app/                  # 应用入口与路由逻辑
│   ├── api/              # 后端 API 路由
│   ├── dashboard/        # 主工作面板
│   ├── story/            # 产品理念介绍页
│   └── layout.tsx        # 全局配置与状态 Provider
├── components/           # React 组件
│   ├── cards/            # 卡片模型 (Gallery, Framework, Principle)
│   ├── auth/             # 认证与用户菜单
│   ├── onboarding/       # 引导系统与提示
│   └── ui/               # 基础设计组件 (Modal, Button, Logo)
├── lib/                  # 核心逻辑与工具函数
│   ├── store.tsx         # 状态管理逻辑
│   ├── local-store.ts    # IndexedDB 封装
│   ├── image-upload.ts   # 图片压缩与上传流水线
│   └── supabase.ts       # Supabase Client 初始化配置
├── public/               # 静态资源
└── scripts/              # 维护脚本与数据提取工具
```

---

## 🚀 开发者指南

### 1. 环境准备

```bash
git clone https://github.com/your-username/ctrl-p.git
cd ctrl-p
npm install
```

### 2. 配置环境变量

在根目录创建 `.env.local` 文件：

```text
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目地址
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase公钥
```

### 3. 初始化数据库

在 Supabase SQL Editor 中运行项目根目录下的 `supabase-schema.sql`，配置表结构与 RLS 策略。

### 4. 运行项目

```bash
npm run dev
```

---

## ⚖️ 许可

本项目基于 [MIT License](LICENSE) 许可发布。

---

**Built with pride for AI Creators.**
