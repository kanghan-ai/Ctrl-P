# Supabase Storage 配置指南

## 📋 前提条件

你已经在 Supabase Dashboard 中完成了以下配置：

- ✅ 创建了名为 `prompt-images` 的 Storage Bucket
- ✅ 设置了公开访问权限
- ✅ 配置了 RLS 策略

## 🔧 验证配置

### 1. 检查 Bucket 是否存在

登录 Supabase Dashboard → Storage → 查看是否有 `prompt-images` bucket

### 2. 检查权限策略

在 Storage → Policies 中应该有以下策略：

```sql
-- 允许认证用户上传
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prompt-images');

-- 允许所有人查看
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'prompt-images');

-- 允许用户删除自己的图片
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'prompt-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🧪 测试上传功能

### 步骤 1: 登录账户

1. 访问应用
2. 点击登录
3. 使用你的账户登录

### 步骤 2: 创建新卡片

1. 点击 "+" 按钮
2. 选择 "Image Prompt"
3. 在编辑模式下，点击 "Upload" 按钮

### 步骤 3: 上传图片

1. 选择一张图片（建议 2-5MB）
2. 观察上传进度提示
3. 等待压缩和上传完成
4. 图片应该显示在卡片中

### 步骤 4: 验证存储

1. 打开 Supabase Dashboard
2. 进入 Storage → prompt-images
3. 应该能看到刚上传的图片文件
4. 文件名格式: `{userId}/{timestamp}-{random}.webp`

## 📊 预期结果

### 成功标志

- ✅ 图片成功压缩到 300KB 以下
- ✅ 图片格式转换为 WebP
- ✅ 图片显示在卡片预览中
- ✅ 保存卡片后，图片 URL 存储在数据库中
- ✅ 刷新页面后，图片仍然正常显示

### 控制台日志

成功上传时，浏览器控制台应该显示：

```
🖼️ 开始压缩图片: example.jpg 原始大小: 2048.00 KB
✅ 压缩完成: 245.67 KB
📤 开始上传到 Supabase Storage: {userId}/1234567890-abc123.webp
✅ 上传成功: {userId}/1234567890-abc123.webp
🔗 公开 URL: https://xxx.supabase.co/storage/v1/object/public/prompt-images/...
```

## ⚠️ 常见问题

### 问题 1: 上传失败 "Bucket not found"

**原因:** Storage Bucket 未创建或名称不匹配

**解决:**
1. 检查 Supabase Dashboard → Storage
2. 确认 bucket 名称为 `prompt-images`
3. 如果不存在，手动创建

### 问题 2: 上传失败 "Permission denied"

**原因:** RLS 策略未正确配置

**解决:**
1. 检查 Storage → Policies
2. 确认有 INSERT 权限策略
3. 确认策略应用于 `authenticated` 角色

### 问题 3: 图片显示 403 错误

**原因:** 公开访问权限未开启

**解决:**
1. 进入 Storage → prompt-images → Settings
2. 确认 "Public bucket" 已开启

### 问题 4: 压缩后图片仍然很大

**原因:** 原图分辨率过高

**解决:**
- 当前配置已限制最大宽高为 1920px
- 如果仍然过大，可以在 `lib/image-upload.ts` 中调整 `maxWidthOrHeight` 参数

## 🎯 功能特性

### 自动压缩

- 目标大小: 300KB
- 最大分辨率: 1920px
- 输出格式: WebP
- 压缩质量: 0.7

### 文件命名

格式: `{userId}/{timestamp}-{random}.webp`

示例: `a1b2c3d4-e5f6-7890-abcd-ef1234567890/1707825600000-x7k9m2.webp`

### 兼容性

- ✅ 登录用户: Supabase Storage (URL)
- ✅ 游客模式: Base64 (向后兼容)
- ✅ 旧数据: 自动识别 Base64 格式

## 📈 性能对比

| 指标 | Base64 | Supabase Storage |
|------|--------|------------------|
| 数据库大小 | 2.67MB/图 | 100 字节/图 |
| 加载速度 | 慢 | 快 (CDN) |
| 存储成本 | 高 | 低 |
| 扩展性 | 差 | 优秀 |

## 🚀 下一步

功能已完成！你可以：

1. 测试上传功能
2. 验证图片显示
3. 检查 Supabase Storage 中的文件
4. 如有问题，查看浏览器控制台日志
