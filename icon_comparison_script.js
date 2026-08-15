const fs = require('fs');
const path = require('path');

// 读取config.json文件
const configPath = 'packages/icons-svg/config.json';
const configContent = fs.readFileSync(configPath, 'utf8');
const iconUrls = JSON.parse(configContent);

// 获取所有图标名称
const iconNames = Object.keys(iconUrls);
console.log(`总共有 ${iconNames.length} 个图标需要比对`);

// 检查本地SVG文件是否存在
const svgDir = 'packages/icons-svg';
let existingFiles = 0;
let missingFiles = 0;
const missingIcons = [];

iconNames.forEach(iconName => {
    const svgPath = path.join(svgDir, `${iconName}.svg`);
    if (fs.existsSync(svgPath)) {
        existingFiles++;
    } else {
        missingFiles++;
        missingIcons.push(iconName);
    }
});

console.log(`\n本地文件检查结果：`);
console.log(`存在的文件: ${existingFiles} 个`);
console.log(`缺失的文件: ${missingFiles} 个`);

if (missingFiles > 0) {
    console.log(`缺失的图标: ${missingIcons.join(', ')}`);
}

// 开始详细比对
console.log(`\n开始详细内容比对...`);

const comparisonResults = {
    identical: [],
    different: [],
    errors: []
};

// 这里需要实现具体的SVG内容比对逻辑
// 由于图标数量较多，建议分批处理