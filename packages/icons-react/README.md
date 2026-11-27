# @nutui/icons-react

京东风格 SVG 图标库 · React 版本

[![NPM version](https://img.shields.io/npm/v/@nutui/icons-react.svg?style=flat)](https://npmjs.org/package/@nutui/icons-react)
[![NPM downloads](https://img.shields.io/npm/dm/@nutui/icons-react.svg?style=flat)](https://npmjs.org/package/@nutui/icons-react)

## 安装

```bash
npm install @nutui/icons-react
# 或
pnpm add @nutui/icons-react
```

**前置依赖（peerDependencies）**

```
react >= 17.0.0
react-dom >= 17.0.0
```

## 使用

### 按需引入（推荐）

ESM 模式下，打包工具（Vite / Webpack 5 / Rollup）会自动 tree-shaking，只打包实际用到的图标。

```tsx
import { Add, ArrowRight, Close } from '@nutui/icons-react'

export default function App() {
  return (
    <>
      <Add width={24} height={24} color="#f00" />
      <ArrowRight />
      <Close onClick={() => console.log('close')} />
    </>
  )
}
```

### 引入样式

ESM 按需引入组件时，基础尺寸样式（`style_icon.css`）、`IconFont` 图片样式（`style_icon_img.css`）及 `Loading`/`Loading1` 旋转样式（`style_icon_loading.css`）已随组件自动按需引入，常规场景无需手动导入。

如需使用内置动画类名（`nut-icon-am-*`，如 `nut-icon-am-rotate`、`nut-icon-am-jump`、`nut-icon-am-blink` 等），请按需引入动画样式：

```tsx
import '@nutui/icons-react/dist/style_icon_animate.css'
```

如需全量图标字体及全部样式（包含动画、Loading、图片样式）：

```tsx
import '@nutui/icons-react/dist/style_iconfont.css'
```

### 图标属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `width` | `string \| number` | — | 宽度，数字自动补 `px` |
| `height` | `string \| number` | — | 高度，数字自动补 `px` |
| `color` | `string` | — | 图标颜色，默认继承 `currentColor` |
| `className` | `string` | `''` | 自定义 class |
| `style` | `CSSProperties` | — | 自定义样式 |
| `onClick` | `(e: MouseEvent) => void` | — | 点击事件 |

### 全局配置

使用 `configure` 设置图标的 class 前缀：

```tsx
import { configure } from '@nutui/icons-react'

configure({
  classPrefix: 'my-icon', // 默认 'nut-icon'
})
```

### UMD / CDN 引入

UMD 产物为全量 bundle，**不支持 tree-shaking**，仅适用于 `<script>` 标签直接引入的场景。

```html
<!-- 基础图标样式；如需 Loading / IconFont 图片 / 内置动画，可按需追加 style_icon_loading.css、style_icon_img.css、style_icon_animate.css，或直接引入 style_iconfont.css -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nutui/icons-react/dist/style_icon.css">
<script src="https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@nutui/icons-react/dist/lib/index.umd.js"></script>
```

## 开源协议

[MIT License](./LICENSE)
