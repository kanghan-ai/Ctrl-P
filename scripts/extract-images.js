/**
 * 提取 Base64 图片并转换为 WebP 文件
 * 
 * 用途：将 lib/preset-cards.json 中的 Base64 图片提取为实际文件
 * 运行：node scripts/extract-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 配置
const CONFIG = {
    inputFile: path.join(__dirname, '../lib/preset-cards.json'),
    outputDir: path.join(__dirname, '../public/images/defaults'),
    outputFile: path.join(__dirname, '../lib/preset-cards.json'),
};

/**
 * 将 Base64 字符串转换为 Buffer
 */
function base64ToBuffer(base64String) {
    // 移除 data:image/xxx;base64, 前缀
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始提取图片...\n');

    // 1. 读取 JSON 文件
    console.log('📖 读取 preset-cards.json...');
    const jsonData = JSON.parse(fs.readFileSync(CONFIG.inputFile, 'utf-8'));
    console.log(`✅ 找到 ${jsonData.cards.length} 张卡片\n`);

    // 2. 创建输出目录
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
        console.log(`📁 创建目录: ${CONFIG.outputDir}\n`);
    }

    // 3. 处理每张卡片
    let imageCount = 0;
    for (let cardIndex = 0; cardIndex < jsonData.cards.length; cardIndex++) {
        const card = jsonData.cards[cardIndex];

        if (!card.images || card.images.length === 0) {
            console.log(`⏭️  卡片 ${cardIndex + 1}: 无图片，跳过`);
            continue;
        }

        console.log(`🖼️  处理卡片 ${cardIndex + 1}: ${card.title || '无标题'}`);

        // 处理该卡片的所有图片
        const newImages = [];
        for (let imgIndex = 0; imgIndex < card.images.length; imgIndex++) {
            const imageData = card.images[imgIndex];

            // 检查是否是 Base64
            if (!imageData.startsWith('data:image/')) {
                console.log(`   ⏭️  图片 ${imgIndex + 1}: 不是 Base64，跳过`);
                newImages.push(imageData);
                continue;
            }

            try {
                // 转换为 Buffer
                const buffer = base64ToBuffer(imageData);
                const originalSize = (buffer.length / 1024).toFixed(2);
                console.log(`   📦 图片 ${imgIndex + 1}: 原始大小 ${originalSize} KB`);

                // 生成文件名
                imageCount++;
                const fileName = `preset-${imageCount}.webp`;
                const filePath = path.join(CONFIG.outputDir, fileName);

                // 使用 sharp 转换为 WebP
                await sharp(buffer)
                    .webp({ quality: 80 })
                    .toFile(filePath);

                // 检查转换后的文件大小
                const stats = fs.statSync(filePath);
                const newSize = (stats.size / 1024).toFixed(2);
                const savings = ((1 - stats.size / buffer.length) * 100).toFixed(1);

                console.log(`   ✅ 转换完成: ${fileName}`);
                console.log(`   💾 新大小: ${newSize} KB (节省 ${savings}%)`);

                // 更新路径
                newImages.push(`/images/defaults/${fileName}`);
            } catch (error) {
                console.error(`   ❌ 转换失败:`, error.message);
                // 保留原始 Base64
                newImages.push(imageData);
            }
        }

        // 更新卡片的图片数组
        card.images = newImages;
        console.log('');
    }

    // 4. 保存更新后的 JSON
    console.log('💾 保存更新后的 JSON 文件...');
    fs.writeFileSync(
        CONFIG.outputFile,
        JSON.stringify(jsonData, null, 2),
        'utf-8'
    );
    console.log(`✅ 已保存到: ${CONFIG.outputFile}\n`);

    // 5. 统计信息
    console.log('📊 转换统计:');
    console.log(`   - 处理卡片数: ${jsonData.cards.length}`);
    console.log(`   - 提取图片数: ${imageCount}`);
    console.log(`   - 输出目录: ${CONFIG.outputDir}`);

    // 6. 计算总大小
    const files = fs.readdirSync(CONFIG.outputDir);
    let totalSize = 0;
    files.forEach(file => {
        const stats = fs.statSync(path.join(CONFIG.outputDir, file));
        totalSize += stats.size;
    });
    console.log(`   - 总文件大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

    console.log('🎉 转换完成！');
}

// 运行
main().catch(error => {
    console.error('❌ 发生错误:', error);
    process.exit(1);
});
