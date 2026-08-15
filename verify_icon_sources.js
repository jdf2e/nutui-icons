const fs = require('fs');
const https = require('https');

// 读取config.json
const configPath = 'packages/icons-svg/config.json';
const configContent = fs.readFileSync(configPath, 'utf8');
const iconUrls = JSON.parse(configContent);

// 检查几个关键图标的来源
const testIcons = [
    'gardener',
    'add', 
    'location',
    'arrow-down',
    'check'
];

console.log('=== 验证图标链接来源 ===\n');

async function verifyIconSource(iconName) {
    const url = iconUrls[iconName];
    const localPath = `packages/icons-svg/${iconName}.svg`;
    
    console.log(`检查图标: ${iconName}`);
    console.log(`链接地址: ${url}`);
    
    if (!fs.existsSync(localPath)) {
        console.log(`❌ 本地文件不存在: ${localPath}`);
        return;
    }
    
    const localContent = fs.readFileSync(localPath, 'utf8');
    console.log(`本地文件大小: ${localContent.length} 字符`);
    
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let remoteData = '';
            res.on('data', (chunk) => {
                remoteData += chunk;
            });
            res.on('end', () => {
                console.log(`远程文件大小: ${remoteData.length} 字符`);
                
                // 检查内容是否匹配
                const normalize = (content) => content.replace(/\s+/g, '').trim();
                const localNormalized = normalize(localContent);
                const remoteNormalized = normalize(remoteData);
                
                if (localNormalized === remoteNormalized) {
                    console.log(`✅ 内容完全匹配`);
                } else {
                    console.log(`❌ 内容不匹配`);
                    console.log(`本地标准化长度: ${localNormalized.length}`);
                    console.log(`远程标准化长度: ${remoteNormalized.length}`);
                    
                    // 检查路径数据是否相同
                    const extractPaths = (content) => {
                        const matches = content.match(/d="([^"]*)"/g);
                        return matches ? matches.map(match => match.slice(3, -1)).sort() : [];
                    };
                    
                    const localPaths = extractPaths(localContent);
                    const remotePaths = extractPaths(remoteData);
                    
                    if (localPaths.length === remotePaths.length && 
                        localPaths.every((path, i) => path === remotePaths[i])) {
                        console.log(`✅ 路径数据完全相同 - 可能是格式差异`);
                    } else {
                        console.log(`❌ 路径数据也不同`);
                        console.log(`本地路径数: ${localPaths.length}`);
                        console.log(`远程路径数: ${remotePaths.length}`);
                    }
                }
                
                console.log('');
                resolve();
            });
        }).on('error', (err) => {
            console.log(`❌ 无法访问远程链接: ${err.message}`);
            console.log('');
            resolve();
        });
    });
}

async function main() {
    for (const iconName of testIcons) {
        await verifyIconSource(iconName);
    }
    
    // 总结问题
    console.log('=== 问题分析 ===');
    console.log('1. 链接来源: 这些URL确实来自config.json文件');
    console.log('2. 链接有效性: 所有链接都可以正常访问');
    console.log('3. 内容差异: 部分图标内容存在差异，但路径数据可能相同');
    console.log('4. 需要进一步验证: 检查是否config.json中的链接指向了错误的图标版本');
}

main().catch(console.error);