const https = require('https');

// 检查几个关键链接的实际返回内容
const testUrls = [
    'https://storage.360buyimg.com/imgtools/befee8a603-5e5652e0-d0e1-11f0-984f-aba4f783b54f.svg', // gardener
    'https://storage.360buyimg.com/imgtools/81adb71e35-159c76f0-a824-11f0-8300-eb1b11b7ce6f.svg',  // add
    'https://storage.360buyimg.com/imgtools/5e1574a613-18869e90-a824-11f0-88d2-edd22479c3d3.svg'   // location
];

console.log('=== 调试远程内容 ===\n');

function checkRemoteContent(url, name) {
    return new Promise((resolve) => {
        console.log(`检查: ${name}`);
        console.log(`URL: ${url}`);
        
        https.get(url, (res) => {
            console.log(`状态码: ${res.statusCode}`);
            console.log(`内容类型: ${res.headers['content-type']}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`内容长度: ${data.length} 字符`);
                
                // 检查内容格式
                if (data.includes('<svg') || data.includes('<?xml')) {
                    console.log('✅ 返回的是SVG内容');
                    
                    // 提取前200字符查看
                    const preview = data.substring(0, 200).replace(/\s+/g, ' ');
                    console.log(`内容预览: ${preview}...`);
                    
                    // 检查是否有路径数据
                    const pathMatches = data.match(/d="([^"]*)"/g);
                    if (pathMatches) {
                        console.log(`路径数量: ${pathMatches.length}`);
                    } else {
                        console.log('⚠️  未找到路径数据');
                    }
                    
                } else if (data.includes('<html') || data.includes('<HTML')) {
                    console.log('❌ 返回的是HTML页面，不是SVG');
                    console.log(`HTML内容预览: ${data.substring(0, 200)}...`);
                } else {
                    console.log('❌ 返回的是未知格式');
                    console.log(`内容预览: ${data.substring(0, 200)}...`);
                }
                
                console.log('---\n');
                resolve();
            });
        }).on('error', (err) => {
            console.log(`❌ 请求失败: ${err.message}`);
            console.log('---\n');
            resolve();
        });
    });
}

async function main() {
    for (let i = 0; i < testUrls.length; i++) {
        const names = ['gardener', 'add', 'location'];
        await checkRemoteContent(testUrls[i], names[i]);
    }
}

main().catch(console.error);