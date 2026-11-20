# @nutui/icons-react Changelog

## 4.1.1

### Features & Optimizations

- 样式按需拆分：将 `style_icon.css` 拆分为 `style_base.css`、`style_loading.css` 与 `style_animation.css`，ES 入口默认仅引入基础与 Loading 样式，大幅降低默认 CSS 体积
- 优化 `package.json` 的 `exports` 与 `sideEffects` 配置，提升构建工具 Tree-shaking 效果

## 4.1.0

### Features

- 全量升级至 V16 图标规范（451 个图标，包含 3dp 线性、4dp 线性加粗、面性及品牌 Logo）
- 修正 `IconTemplate` 默认视口与 V16 48x48 规范对齐
- 规范化 `config.json` 图标分类配置与 3dp 对标老版粗细标注

## 4.1.0-beta.3

### Fixes

- 更新 `arrow-radius` 图标 path 与 CDN 地址

## 4.1.0-beta.2

### Fixes

- 移除 `config.json` 中已废弃但残留的无效图标（`instocks`、`always-buy`、`share-2`、`share-f`、`star-2`、`star-3`），修复展示为空白的问题
- 修正 `config.json` 中 `qr-code` 为 `qrcode`

## 4.1.0-beta.1

### Features

- 全量同步 v16 图标库，图标总数 451 个
- 新增/补充线性、粗体（-i）、面性（-f）图标及 6 个兼容图标（`Checked`、`HeartFill`、`ImageError`、`StarFill`、`TriangleDown`、`TriangleUp`）
- 适配 48x48 viewBox
- 版本号规范化：去除 `cpp` 标记
