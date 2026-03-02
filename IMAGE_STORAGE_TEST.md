# 图片存储重构测试指南

## 🧪 测试清单

### 第一阶段：默认卡片测试

#### 1. 验证图片文件

**检查文件是否生成**:
```bash
ls public/images/defaults/
```

**预期结果**:
```
preset-1.webp (52 KB)
preset-2.webp (45 KB)
preset-3.webp (42 KB)
preset-4.webp (159 KB)
```

#### 2. 测试默认卡片加载

**步骤**:
1. 清除浏览器缓存
2. 打开应用（未登录状态）
3. 检查是否显示默认卡片
4. 打开 DevTools → Network
5. 查看图片请求

**预期结果**:
- ✅ 默认卡片正常显示
- ✅ 图片从 `/images/defaults/preset-X.webp` 加载
- ✅ 图片大小正确（< 200KB）
- ✅ 加载速度快

---

### 第二阶段：IndexedDB 存储测试

#### 1. 游客模式上传图片

**步骤**:
1. 确保未登录
2. 点击 "+" 创建新卡片
3. 选择 "Image Prompt"
4. 点击 "Add Image" 上传图片
5. 观察上传过程

**预期结果**:
- ✅ 显示上传进度提示
- ✅ 图片成功上传
- ✅ 图片显示在卡片中

**控制台日志**:
```
💾 图片已保存到 IndexedDB: img-1707825600000-x7k9m2 (245.67 KB)
```

#### 2. 验证 IndexedDB 存储

**步骤**:
1. 打开 DevTools → Application
2. 展开 IndexedDB
3. 查看 `keyval-store` 数据库
4. 检查存储的图片

**预期结果**:
- ✅ 看到 `img-xxxxxxxxxx-xxxxx` 键
- ✅ 值类型为 Blob
- ✅ 大小与上传的图片一致

#### 3. 刷新页面测试

**步骤**:
1. 刷新页面（F5）
2. 检查卡片是否仍然显示
3. 检查图片是否正常加载

**预期结果**:
- ✅ 卡片数据保留
- ✅ 图片正常显示
- ✅ 无错误提示

**控制台日志**:
```
📖 从 IndexedDB 读取图片: img-1707825600000-x7k9m2 (245.67 KB)
🔗 创建临时 URL: blob:http://localhost:3000/xxx-xxx-xxx
```

#### 4. 内存管理测试

**步骤**:
1. 打开 DevTools → Performance Monitor
2. 上传 5-10 张图片
3. 在不同卡片之间切换
4. 观察内存使用情况

**预期结果**:
- ✅ 内存使用稳定
- ✅ 切换卡片时内存不持续增长
- ✅ 控制台显示 URL 释放日志

**控制台日志**:
```
🧹 释放临时 URL: blob:http://localhost:3000/xxx-xxx-xxx
```

---

### 第三阶段：Base64 迁移测试

#### 1. 创建测试数据

**手动添加 Base64 数据到 localStorage**:

```javascript
// 在浏览器控制台执行
const testCard = {
  id: "test-base64",
  type: "gallery",
  title: "Base64 测试",
  images: [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  ],
  tags: [],
  description: "测试 Base64 自动迁移"
};

const existingCards = JSON.parse(localStorage.getItem('guest_cards') || '[]');
existingCards.push(testCard);
localStorage.setItem('guest_cards', JSON.stringify(existingCards));
```

#### 2. 测试自动迁移

**步骤**:
1. 刷新页面
2. 打开控制台
3. 查看迁移日志
4. 检查 IndexedDB

**预期结果**:
- ✅ 图片正常显示
- ✅ 控制台显示迁移日志
- ✅ IndexedDB 中有新的图片数据
- ✅ localStorage 中的引用已更新为 `idb://...`

**控制台日志**:
```
🔄 检测到 Base64 图片，开始迁移...
💾 图片已保存到 IndexedDB: img-xxx (0.07 KB)
✅ 迁移完成
📖 从 IndexedDB 读取图片: img-xxx (0.07 KB)
🔗 创建临时 URL: blob:http://localhost:3000/xxx
```

---

### 第四阶段：数据迁移测试

#### 1. 游客数据迁移到登录账户

**步骤**:
1. 游客模式下上传几张图片
2. 登录账户
3. 在数据迁移弹窗中点击 "Import to Account"
4. 等待迁移完成

**预期结果**:
- ✅ 显示迁移进度
- ✅ 图片上传到 Supabase Storage
- ✅ IndexedDB 中的图片被删除
- ✅ 数据库中存储的是 Supabase URL

**注意**: 这个功能需要额外实现，当前版本尚未完成。

---

## 🐛 常见问题排查

### 问题 1: 默认卡片不显示

**可能原因**:
- 图片文件未生成
- 路径错误

**解决方法**:
```bash
# 重新运行提取脚本
node scripts/extract-images.js

# 检查文件是否存在
ls public/images/defaults/
```

### 问题 2: 游客上传失败

**可能原因**:
- IndexedDB 不可用
- 浏览器不支持

**解决方法**:
1. 检查浏览器控制台错误
2. 确认浏览器支持 IndexedDB
3. 检查是否在隐私模式下（可能禁用 IndexedDB）

### 问题 3: 图片显示为 "Failed to load"

**可能原因**:
- IndexedDB 数据丢失
- URL 格式错误

**解决方法**:
1. 检查控制台错误日志
2. 打开 DevTools → Application → IndexedDB
3. 验证图片数据是否存在

### 问题 4: 内存持续增长

**可能原因**:
- URL 未正确释放
- 组件未正确卸载

**解决方法**:
1. 检查控制台是否有 "释放临时 URL" 日志
2. 确认 IDBImage 组件的 useEffect 清理函数正常执行

---

## 📊 性能验证

### 使用 Chrome DevTools

**Memory Profiler**:
1. 打开 DevTools → Memory
2. 点击 "Take snapshot"
3. 上传几张图片
4. 再次 "Take snapshot"
5. 比较两次快照

**预期结果**:
- IndexedDB 占用增加（正常）
- JavaScript 堆内存稳定（不持续增长）

**Network Panel**:
1. 打开 DevTools → Network
2. 刷新页面
3. 查看图片请求

**预期结果**:
- 默认图片从 `/images/defaults/` 加载
- 大小 < 200KB
- 加载时间 < 100ms

---

## ✅ 测试通过标准

### 功能测试

- [ ] 默认卡片正常显示
- [ ] 游客模式可以上传图片
- [ ] 图片保存到 IndexedDB
- [ ] 刷新后图片仍然显示
- [ ] Base64 自动迁移成功

### 性能测试

- [ ] 默认图片加载快（< 100ms）
- [ ] 内存使用稳定（无泄漏）
- [ ] IndexedDB 存储正常

### 兼容性测试

- [ ] Chrome 浏览器正常
- [ ] Firefox 浏览器正常
- [ ] Safari 浏览器正常（如适用）

---

## 🎉 测试完成

如果所有测试通过，图片存储重构成功！

**下一步**:
1. 监控生产环境性能
2. 收集用户反馈
3. 根据需要优化
