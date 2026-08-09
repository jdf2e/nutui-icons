# 如何新增/替换 SVG 图标（icons-react-taro）

## 概览

本文档描述向 `@nutui/icons-react-taro` 包新增或替换图标的完整流程。

## 快速方式：使用 Claude Code Skill

在 Claude Code 中直接输入：

```
/upgrade-icons
```

该 skill 会引导你完成从 SVG 准备到发布的全流程，适合批量操作 200+ 图标。

## 前置条件

- 全局安装字体生成工具：`npm install -g svg2ttf ttf2woff ttf2woff2 ttf2eot`
- 新图标的 SVG 源文件（设计稿导出）

## 步骤

### 1. 准备 48x48 的 SVG 文件

将新图标 SVG 放入 `packages/icons-svg/` 目录，格式要求：

```xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
  viewBox="0 0 48 48">
  <defs />
  <g style="mix-blend-mode:pass-through;opacity:1" transform="matrix(1,0,0,1,0,0)">
    <g style="mix-blend-mode:pass-through;opacity:1" transform="matrix(1,0,0,1,0,0)">
      <path
        d="..."
        fill-rule="NONZERO" fill="#171a26" fill-opacity="1" style="mix-blend-mode:normal" />
    </g>
  </g>
</svg>
```

如果设计稿是 1024x1024，需要按 `48/1024` 比例缩放 path 坐标（注意 arc 命令的 flag 参数不缩放）。

### 2. 上传 SVG 到 CDN

将 48x48 的 SVG 文件上传到 `storage.360buyimg.com`，获取 CDN URL。

### 3. 更新 `packages/icons-svg/config.json`

将新图标的 CDN URL 写入 config.json：

```json
{
  "icon-name": "https://storage.360buyimg.com/imgtools/xxx.svg"
}
```

### 4. 更新 iconfont 字体文件

#### 4.1 修改 `iconfont/iconfont.svg`

在 SVG 字体文件中添加/替换 glyph。注意字体文件使用 **1024 单位 + Y 轴翻转坐标系**：

```xml
<glyph glyph-name="nut-icon-{name}" unicode="&#x{code};" d="{1024坐标系path}" horiz-adv-x="1024" vert-adv-y="1024" />
```

- 如果是从 iconfont 平台导出的 JSON，使用 `d` 字段（字体坐标系，Y-up）

#### 4.2 修改 `iconfont/iconfont.js`

更新对应 symbol 的 path data。JS 使用 **标准 SVG 坐标系（Y-down）**：

- 如果是从 iconfont 平台导出的 JSON，使用 `originDs[0].d` 字段

#### 4.3 重新生成字体二进制文件

```bash
svg2ttf iconfont/iconfont.svg iconfont/iconfont.ttf
ttf2woff iconfont/iconfont.ttf iconfont/iconfont.woff
cat iconfont/iconfont.ttf | npx ttf2woff2 > iconfont/iconfont.woff2
ttf2eot iconfont/iconfont.ttf iconfont/iconfont.eot
```

#### 4.4 验证

打开 `iconfont/demo_index.html`，确认 Unicode、Font class、Symbol 三种模式都能正确显示。

### 5. 生成 React Taro 组件

```bash
npm run tsnode
```

此命令执行 `scripts/generate-react.ts`，会自动：
- 读取 `packages/icons-svg/*.svg` 生成 svg64
- 读取 `packages/icons-svg/config.json` 获取鸿蒙端 CDN 地址
- 写入 `packages/icons-react-taro/src/components/{Name}.tsx`
- 更新入口文件 `lib-new.ts`、`lib-new-dts.ts`、`iconsConfig.ts`

### 6. 如果只发布 taro 版本

撤销 `icons-react` 的变更（generate 脚本会同时生成两个包）：

```bash
git checkout -- packages/icons-react/
```

### 7. 升级版本号

修改 `packages/icons-react-taro/package.json` 中的 `version` 字段。

### 8. 构建

```bash
cd packages/icons-react-taro
npm run build
```

### 9. 提交、打 tag、发布

```bash
git add <相关文件>
git commit -m "feat: 描述"
git tag @nutui/icons-react-taro@{version}
git push origin <branch>
git push origin @nutui/icons-react-taro@{version}

cd packages/icons-react-taro
npm publish --tag beta
```

## 注意事项

- `iconfont/iconfont.svg` 的 glyph path 使用 1024 单位 + Y-up 坐标系
- `iconfont/iconfont.js` 的 symbol path 使用标准 SVG Y-down 坐标系
- `packages/icons-svg/*.svg` 使用 48x48 viewBox
- `iconfont/iconfont.css` 只在新增图标时需要修改（替换不需要，因为 unicode 不变）
- 替换图标时保持原有的 `glyph-name` 和 `unicode`，只替换 `d` 属性
