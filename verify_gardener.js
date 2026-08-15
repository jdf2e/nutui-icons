const fs = require('fs');
const https = require('https');

// 读取本地gardener.svg
const localPath = 'packages/icons-svg/gardener.svg';
const localContent = fs.readFileSync(localPath, 'utf8');

// 获取远程gardener.svg
const remoteUrl = 'https://storage.360buyimg.com/imgtools/befee8a603-5e5652e0-d0e1-11f0-984f-aba4f783b54f.svg';

console.log('=== Gardener 图标详细比对 ===\n');

// 获取远程内容
https.get(remoteUrl, (res) => {
    let remoteData = '';
    res.on('data', (chunk) => {
        remoteData += chunk;
    });
    res.on('end', () => {
        console.log('远程内容长度:', remoteData.length);
        console.log('本地内容长度:', localContent.length);
        
        console.log('\n=== 内容详细对比 ===');
        
        // 标准化内容（移除多余空格和换行）
        const normalizeContent = (content) => {
            return content
                .replace(/\s+/g, ' ')
                .replace(/>\s+</g, '><')
                .trim();
        };
        
        const normalizedRemote = normalizeContent(remoteData);
        const normalizedLocal = normalizeContent(localContent);
        
        console.log('标准化后远程长度:', normalizedRemote.length);
        console.log('标准化后本地长度:', normalizedLocal.length);
        
        // 检查是否相同
        const isIdentical = normalizedRemote === normalizedLocal;
        console.log('\n是否完全相同:', isIdentical);
        
        if (!isIdentical) {
            console.log('\n=== 内容差异分析 ===');
            
            // 显示前200个字符对比
            console.log('远程内容前200字符:');
            console.log(normalizedRemote.substring(0, 200));
            console.log('\n本地内容前200字符:');
            console.log(normalizedLocal.substring(0, 200));
            
            // 查找第一个不同点
            let firstDiff = -1;
            const minLength = Math.min(normalizedRemote.length, normalizedLocal.length);
            for (let i = 0; i < minLength; i++) {
                if (normalizedRemote[i] !== normalizedLocal[i]) {
                    firstDiff = i;
                    break;
                }
            }
            
            if (firstDiff !== -1) {
                console.log(`\n第一个不同点在位置: ${firstDiff}`);
                console.log('远程内容在该位置附近:');
                console.log(normalizedRemote.substring(Math.max(0, firstDiff - 20), firstDiff + 20));
                console.log('本地内容在该位置附近:');
                console.log(normalizedLocal.substring(Math.max(0, firstDiff - 20), firstDiff + 20));
            }
        }
        
        // 检查视觉元素是否相同
        console.log('\n=== 视觉元素分析 ===');
        
        // 提取路径数据
        const extractPathData = (content) => {
            const pathMatches = content.match(/d="([^"]+)"/g);
            return pathMatches ? pathMatches.map(match => match.slice(3, -1)) : [];
        };
        
        const remotePaths = extractPathData(remoteData);
        const localPaths = extractPathData(localContent);
        
        console.log('远程路径数量:', remotePaths.length);
        console.log('本地路径数量:', localPaths.length);
        
        if (remotePaths.length === localPaths.length) {
            let allPathsSame = true;
            for (let i = 0; i < remotePaths.length; i++) {
                if (remotePaths[i] !== localPaths[i]) {
                    allPathsSame = false;
                    console.log(`路径 ${i + 1} 不同:`);
                    console.log('远程:', remotePaths[i].substring(0, 100) + '...');
                    console.log('本地:', localPaths[i].substring(0, 100) + '...');
                    break;
                }
            }
            if (allPathsSame) {
                console.log('所有路径数据完全相同！');
            }
        } else {
            console.log('路径数量不同');
        }
        
    });
}).on('error', (err) => {
    console.error('获取远程内容失败:', err);
});