# upgrade-icons

批量新增/替换 nutui-icons 图标的自动化 skill。从 48x48 SVG 源文件出发，一键生成 iconfont 全套文件并更新 React Taro 组件。

## 使用方式

```
/upgrade-icons
```

---

## 前置条件

- 全局安装字体工具: `npm install -g svg2ttf ttf2woff ttf2woff2 ttf2eot`
- 新图标的 48x48 SVG 文件已放入 `packages/icons-svg/`
- 如需鸿蒙端支持，需提前上传 SVG 到 CDN 并更新 `packages/icons-svg/config.json`

## 执行步骤

### Step 1: 确认输入

检查用户是否已准备好 SVG 文件:

```bash
ls packages/icons-svg/*.svg | wc -l
```

确认新增/替换的图标文件已在 `packages/icons-svg/` 目录中，格式为:

```xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
  viewBox="0 0 48 48">
  <defs />
  <g style="mix-blend-mode:pass-through;opacity:1" transform="matrix(1,0,0,1,0,0)">
    <g style="mix-blend-mode:pass-through;opacity:1" transform="matrix(1,0,0,1,0,0)">
      <path d="..." fill-rule="NONZERO" fill="#171a26" fill-opacity="1" style="mix-blend-mode:normal" />
    </g>
  </g>
</svg>
```

如果设计稿是 1024x1024，需先缩放:
- 比例: 48/1024
- 注意: arc 命令的 flag 参数(large-arc-flag, sweep-flag)不缩放

### Step 2: 生成 iconfont 全套文件

```bash
python3 scripts/generate-iconfont.py
```

该脚本自动完成:
- 读取 `packages/icons-svg/*.svg`
- 生成 `iconfont/iconfont.svg` (1024 单位, Y-up 字体坐标系)
- 生成 `iconfont/iconfont.js` (1024 单位, Y-down SVG 坐标系, symbol 模式)
- 生成 `iconfont/iconfont.css` (font class 模式)
- 生成 `iconfont/iconfont.ttf/.woff/.woff2/.eot` (字体二进制)

逻辑:
- 已有图标: 保留原 unicode 码位，替换 path data
- 新增图标: 自动分配下一个可用 unicode 码位

### Step 3: 验证 iconfont

```bash
open iconfont/demo_index.html
```

检查 Unicode、Font class、Symbol 三种模式是否正常显示。

### Step 4: 更新 CDN 配置 (鸿蒙端)

如果有新的 CDN URL，更新 `packages/icons-svg/config.json`:

```json
{
  "icon-name": "https://storage.360buyimg.com/imgtools/xxx.svg"
}
```

### Step 5: 生成 React Taro 组件

```bash
npm run tsnode
```

生成:
- `packages/icons-react-taro/src/components/{Name}.tsx` (svg64 + CDN)
- `packages/icons-react-taro/src/buildEntry/lib-new.ts`
- `packages/icons-react-taro/src/buildEntry/lib-new-dts.ts`
- `packages/icons-react-taro/src/components/iconsConfig.ts`

### Step 6: 撤销非 taro 包的变更 (如果只发 taro)

```bash
git checkout -- packages/icons-react/
```

### Step 7: 构建

```bash
cd packages/icons-react-taro && npm run build
```

### Step 8: 发布包（必要操作）

以下步骤为发布包的**必要操作**，缺一不可，必须按顺序执行：

#### 8.1 修改 changelog

更新 `packages/icons-react-taro/CHANGELOG.md`，在顶部添加新版本记录:

```markdown
## {new-version}

### New Icons

- 新增 `IconName` 图标

### Changes

- 其他变更说明
```

#### 8.2 修改版本号

修改 `packages/icons-react-taro/package.json` 和 `packages/icons-react/package.json` 中的 version，两个包版本号保持一致。

#### 8.3 提交代码

```bash
git add <相关文件>
git commit -m "feat: 新增 XXX 图标，发布 @nutui/icons-react-taro@{version}"
```

#### 8.4 Push

```bash
git push origin <branch>
```

#### 8.5 打 tag

```bash
git tag v{version}
git push origin v{version}
```

### Step 9: npm 发布

```bash
cd packages/icons-react-taro && npm publish --tag beta
cd packages/icons-react && npm publish --tag beta
```

---

## 坐标系说明

| 文件 | viewBox | 坐标系 | 说明 |
|------|---------|--------|------|
| `packages/icons-svg/*.svg` | 0 0 48 48 | Y-down | 组件源文件 |
| `iconfont/iconfont.js` (symbol) | 0 0 1024 1024 | Y-down | 48→1024 缩放 |
| `iconfont/iconfont.svg` (font) | 1024 units | Y-up | 48→1024 缩放 + Y翻转 |

Y翻转公式 (ascent=896):
- 绝对坐标: `Y_font = 896 - Y_svg`
- 相对坐标: `dy_font = -dy_svg`
- arc sweep-flag: `0↔1` 互换

## 关键文件

| 文件 | 作用 |
|------|------|
| `scripts/generate-iconfont.py` | 批量生成 iconfont 全套文件 |
| `scripts/generate-react.ts` | 生成 React/Taro 组件 (`npm run tsnode`) |
| `packages/icons-svg/config.json` | 图标 CDN URL 映射 (鸿蒙端用) |
| `iconfont/config.json` | 图标分类配置 (demo 展示用) |

## 注意事项

- 替换图标时名称不变，脚本自动保留原 unicode
- 新增图标自动分配下一个码位，无需手动管理
- `iconfont/config.json` (分类配置) 需要手动维护新增图标的分类
- 多 path 的 SVG 会合并为单个 glyph
- 运行 `npm run tsnode` 会同时生成 `icons-react` 和 `icons-react-taro`，按需撤销
- **发布时必须完成: 修改 changelog → 修改版本号 → 提交代码 → push → 打 tag**，这是发布包的必要流程
