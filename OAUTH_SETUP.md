# OAuth 第三方登录配置指南

本文档介绍如何在 Supabase 中配置 Google 和 GitHub OAuth 登录。

## 前提条件

- 已创建 Supabase 项目
- 可以访问 Supabase Dashboard

---

## Google OAuth 配置

### 1. 在 Google Cloud Console 创建 OAuth 凭据

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 导航到 **APIs & Services** → **Credentials**
4. 点击 **Create Credentials** → **OAuth client ID**
5. 选择应用类型：**Web application**
6. 配置：
   - **Name**: 任意名称（例如：CTRL+P Auth）
   - **Authorized redirect URIs**: 添加以下 URL
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
     > 💡 在 Supabase Dashboard → Settings → API 中找到您的项目 URL

7. 点击 **Create** 并保存 **Client ID** 和 **Client Secret**

### 2. 在 Supabase 中启用 Google Provider

1. 打开 Supabase Dashboard
2. 导航到 **Authentication** → **Providers**
3. 找到 **Google** 并点击展开
4. 填入：
   - **Client ID**: 从 Google Cloud Console 获取
   - **Client Secret**: 从 Google Cloud Console 获取
5. 点击 **Save**

---

## GitHub OAuth 配置

### 1. 在 GitHub 创建 OAuth App

1. 访问 [GitHub Settings](https://github.com/settings/developers)
2. 点击 **OAuth Apps** → **New OAuth App**
3. 填写信息：
   - **Application name**: CTRL+P
   - **Homepage URL**: `http://localhost:3000` (开发环境) 或您的生产域名
   - **Authorization callback URL**: 
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
4. 点击 **Register application**
5. 在应用页面，点击 **Generate a new client secret**
6. 保存 **Client ID** 和 **Client Secret**

### 2. 在 Supabase 中启用 GitHub Provider

1. 打开 Supabase Dashboard
2. 导航到 **Authentication** → **Providers**
3. 找到 **GitHub** 并点击展开
4. 填入：
   - **Client ID**: 从 GitHub OAuth App 获取
   - **Client Secret**: 从 GitHub OAuth App 获取
5. 点击 **Save**

---

## 验证配置

配置完成后，访问您的应用：
- 开发环境: http://localhost:3000/login
- 点击 Google 或 GitHub 按钮
- 应该会跳转到相应的授权页面
- 授权后会自动跳转回 `/dashboard`

---

## 常见问题

### 1. 重定向 URI 不匹配错误
**问题**: `redirect_uri_mismatch` 或类似错误

**解决方案**: 
- 确保在 Google Cloud Console 或 GitHub OAuth App 中配置的回调 URL 与 Supabase 项目 URL 完全一致
- URL 格式: `https://<your-project-ref>.supabase.co/auth/v1/callback`

### 2. 本地开发测试
**问题**: 本地测试 OAuth 登录

**解决方案**:
- OAuth 提供商需要 HTTPS，但 Supabase 会处理这个问题
- 确保在 OAuth 应用配置中添加了正确的回调 URL
- 本地开发时，授权后会跳转到 `http://localhost:3000/dashboard`

### 3. 用户数据获取
OAuth 登录成功后，用户信息会自动存储在 Supabase Auth 中，包括：
- Email
- Name
- Avatar URL
- Provider (google/github)

可以通过 `supabase.auth.getUser()` 获取用户信息。

---

## 生产环境部署

部署到生产环境时，需要更新 OAuth 应用配置：

1. **Google Cloud Console**:
   - 在 Authorized redirect URIs 中保留 Supabase 的回调 URL
   
2. **GitHub OAuth App**:
   - 更新 Homepage URL 为生产域名
   - Authorization callback URL 保持为 Supabase 的回调 URL

3. **环境变量**:
   确保生产环境中设置了正确的 Supabase 环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
