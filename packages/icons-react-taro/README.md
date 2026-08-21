# @nutui/icons-react-taro

京东风格 SVG 图标库 · React Taro 版本

[![NPM version](https://img.shields.io/npm/v/@nutui/icons-react-taro.svg?style=flat)](https://npmjs.org/package/@nutui/icons-react-taro)
[![NPM downloads](https://img.shields.io/npm/dm/@nutui/icons-react-taro.svg?style=flat)](https://npmjs.org/package/@nutui/icons-react-taro)

## 安装

```bash
npm install @nutui/icons-react-taro
# 或
pnpm add @nutui/icons-react-taro
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
import { Add, ArrowRight, Close } from '@nutui/icons-react-taro'

export default function Index() {
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

```tsx
import '@nutui/icons-react-taro/dist/style_iconfont.css'
```

### 图标属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `width` | `string \| number` | — | 宽度，数字自动补 `px` |
| `height` | `string \| number` | — | 高度，数字自动补 `px` |
| `size` | `string \| number` | — | 同时设置宽高 |
| `color` | `string` | — | 图标颜色，默认继承 `currentColor` |
| `className` | `string` | `''` | 自定义 class |
| `style` | `CSSProperties` | — | 自定义样式 |
| `onClick` | `(e: MouseEvent) => void` | — | 点击事件 |

### 全局配置

```tsx
import { configure } from '@nutui/icons-react-taro'

configure({
  classPrefix: 'my-icon', // 默认 'nut-icon'
})
```

## 开源协议

[MIT License](./LICENSE)
