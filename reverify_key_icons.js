const fs = require('fs');
const https = require('https');

// 需要重新验证的关键图标
const keyIcons = [
    { name: 'gardener', url: 'https://storage.360buyimg.com/imgtools/befee8a603-5e5652e0-d0e1-11f0-984f-aba4f783b54f.svg' },
    { name: 'add', url: 'https://storage.360buyimg.com/imgtools/81adb71e35-159c76f0-a824-11f0-8300-eb1b11b7ce6f.svg' },
    { name: 'location', url: 'https://storage.360buyimg.com/imgtools/5e1574a613-18869e90-a824-11f0-88d2-edd22479c3d3.svg' }
];

// 更精确的比对函数
function preciseCompare(content1, content2) {
    // 移除所有空白字符进行比对
    const normalize = (content) => {
        return content
            .replace(/\s+/g, '') // 移除所有空白
            .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
            .trim();
    };
    
    const norm1 = normalize(content1);
    const norm2 = normalize(content2);
    
    if (norm1 === norm2) {
        return { identical: true, method: 'normalized' };
    }
    
    // 如果标准化后还不相同，检查路径数据
    const extractPaths = (content) => {
        const matches = content.match(/d="([^"]*)"/g);
        return matches ? matches.sort() : [];
    };
    
    const paths1 = extractPaths(content1);
    const paths2 = extractPaths(content2);
    
    if (paths1.length === paths2.length && paths1.every((path, i) => path === paths2[i])) {
        return { identical: true, method: 'paths_only' };
    }
    
    return { 
        identical: false, 
        method: 'different',
        pathCount1: paths1.length,
        pathCount2: paths2.length,
        normLength1: norm1.length,
        normLength2: norm2.length
    };
}

async function verifyIcon(icon) {
    return new Promise((resolve) => {
        const localPath = `packages/icons-svg/${icon.name}.svg`;
        
        if (!fs.existsSync(localPath)) {
            console.log(`❌ ${icon.name}: 本地文件不存在`);
            resolve({ name: icon.name, status: 'missing_local' });
            return;
        }
        
        const localContent = fs.readFileSync(localPath, 'utf8');
        
        https.get(icon.url, (res) => {
            let remoteData = '';
            res.on('data', (chunk) => {
                remoteData += chunk;
            });
            res.on('end', () => {
                const comparison = preciseCompare(localContent, remoteData);
                
                if (comparison.identical) {
                    console.log(`✅ ${icon.name}: 完全相同 (${comparison.method})`);
                } else {
                    console.log(`❌ ${icon.name}: 内容不同`);
                    console.log(`   本地标准化长度: ${comparison.normLength1}`);
                    console.log(`   远程标准化长度: ${comparison.normLength2}`);
                    console.log(`   本地路径数: ${comparison.pathCount1}`);
                    console.log(`   远程路径数: ${comparison.pathCount2}`);
                    
                    // 显示前100字符对比
                    const localStart = localContent.replace(/\s+/g, '').substring(0, 100);
                    const remoteStart = remoteData.replace(/\s+/g, '').substring(0, 100);
                    console.log(`   本地开头: ${localStart}...`);
                    console.log(`   远程开头: ${remoteStart}...`);
                }
                
                resolve({ 
                    name: icon.name, 
                    status: comparison.identical ? 'identical' : 'different',
                    method: comparison.method,
                    localLength: localContent.length,
                    remoteLength: remoteData.length
                });
            });
        }).on('error', (err) => {
            console.log(`❌ ${icon.name}: 获取远程内容失败 - ${err.message}`);
            resolve({ name: icon.name, status: 'remote_error', error: err.message });
        });
    });
}

async function main() {
    console.log('=== 重新验证关键图标 ===\n');
    
    for (const icon of keyIcons) {
        await verifyIcon(icon);
        console.log('');
    }
}

main().catch(console.error);