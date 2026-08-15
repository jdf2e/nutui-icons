const fs = require('fs');
const path = require('path');
const https = require('https');

// 读取config.json文件
const configPath = 'packages/icons-svg/config.json';
const configContent = fs.readFileSync(configPath, 'utf8');
const iconUrls = JSON.parse(configContent);

// 获取所有图标名称
const iconNames = Object.keys(iconUrls);
console.log(`开始详细比对 ${iconNames.length} 个图标...`);

// 比对结果统计
const results = {
    identical: [],
    different: [],
    errors: [],
    processed: 0
};

// 获取链接内容的函数
function fetchSvgContent(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// 标准化SVG内容（移除空格和换行，便于比对）
function normalizeSvgContent(content) {
    return content.replace(/\s+/g, ' ').trim();
}

// 比对单个图标
async function compareIcon(iconName, index, total) {
    try {
        console.log(`[${index}/${total}] 比对图标: ${iconName}`);
        
        const url = iconUrls[iconName];
        const localPath = path.join('packages/icons-svg', `${iconName}.svg`);
        
        // 获取链接内容
        const remoteContent = await fetchSvgContent(url);
        
        // 读取本地文件
        const localContent = fs.readFileSync(localPath, 'utf8');
        
        // 标准化内容
        const normalizedRemote = normalizeSvgContent(remoteContent);
        const normalizedLocal = normalizeSvgContent(localContent);
        
        // 比对
        if (normalizedRemote === normalizedLocal) {
            results.identical.push(iconName);
            console.log(`  ✅ 完全一致`);
        } else {
            results.different.push({
                name: iconName,
                remoteLength: normalizedRemote.length,
                localLength: normalizedLocal.length
            });
            console.log(`  ❌ 内容不同`);
        }
        
        results.processed++;
        
    } catch (error) {
        results.errors.push({
            name: iconName,
            error: error.message
        });
        console.log(`  ⚠️  处理错误: ${error.message}`);
        results.processed++;
    }
}

// 分批处理函数
async function processBatch(startIndex, batchSize) {
    const endIndex = Math.min(startIndex + batchSize, iconNames.length);
    
    for (let i = startIndex; i < endIndex; i++) {
        await compareIcon(iconNames[i], i + 1, iconNames.length);
        
        // 添加小延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// 主处理函数
async function main() {
    const batchSize = 10; // 每批处理10个图标
    let currentIndex = 0;
    
    while (currentIndex < iconNames.length) {
        console.log(`\n处理第 ${Math.floor(currentIndex / batchSize) + 1} 批 (${currentIndex + 1}-${Math.min(currentIndex + batchSize, iconNames.length)})`);
        
        await processBatch(currentIndex, batchSize);
        currentIndex += batchSize;
        
        // 显示当前统计
        console.log(`\n当前统计:`);
        console.log(`已处理: ${results.processed}`);
        console.log(`完全一致: ${results.identical.length}`);
        console.log(`内容不同: ${results.different.length}`);
        console.log(`处理错误: ${results.errors.length}`);
    }
    
    // 生成最终报告
    generateReport();
}

// 生成报告
function generateReport() {
    console.log(`\n========== 详细比对报告 ==========`);
    console.log(`总图标数: ${iconNames.length}`);
    console.log(`完全一致: ${results.identical.length} (${(results.identical.length / iconNames.length * 100).toFixed(1)}%)`);
    console.log(`内容不同: ${results.different.length} (${(results.different.length / iconNames.length * 100).toFixed(1)}%)`);
    console.log(`处理错误: ${results.errors.length}`);
    
    if (results.different.length > 0) {
        console.log(`\n内容不同的图标:`);
        results.different.forEach(item => {
            console.log(`  - ${item.name} (远程长度: ${item.remoteLength}, 本地长度: ${item.localLength})`);
        });
    }
    
    if (results.errors.length > 0) {
        console.log(`\n处理错误的图标:`);
        results.errors.forEach(item => {
            console.log(`  - ${item.name}: ${item.error}`);
        });
    }
    
    // 保存详细结果到文件
    const reportPath = 'icon_comparison_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n详细结果已保存到: ${reportPath}`);
}

// 运行主函数
main().catch(console.error);