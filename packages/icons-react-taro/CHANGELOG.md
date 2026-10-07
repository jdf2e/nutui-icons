# @nutui/icons-react-taro Changelog

## 4.1.0-beta.1

### New Icons

- 补充 6 个兼容图标：`Checked` (checked)、`HeartFill` (heart-fill)、`ImageError` (image-error)、`StarFill` (star-fill)、`TriangleDown` (triangle-down)、`TriangleUp` (triangle-up)

### Changes

- 更新 `config.json` CDN 地址映射
- 重新生成 iconfont 字体文件（.svg/.js/.css/.ttf/.woff/.woff2/.eot）及 Taro 组件

## 4.1.0-beta.0

### Breaking Changes

- 全量更新至 v16 图标库，图标总数 445 个
- 移除 14 个旧图标：`checked`、`heart-fill`、`image-error`、`instocks`、`qr-code`、`share-2`、`share-f`、`star-2`、`star-3`、`star-fill`、`always-buy`、`always-buy-f` 等（已由 v16 体系图标替代）

### New Icons

- 新增 255 个图标，覆盖三种风格：
  - 3dp 线性（默认）：新增 65 个
  - 4dp 线性（`-i` 后缀）：新增 161 个
  - 面性（`-f` 后缀）：新增 29 个

### Changes

- 所有 SVG 源文件统一缩放为 `0 0 48 48` viewBox
- 全量更新 `config.json` 的 CDN 地址（鸿蒙端 svgSrc）
- 重新生成 iconfont 字体文件（.svg/.js/.css/.ttf/.woff/.woff2/.eot）
- 版本号规范化：去除 `cpp` 标记

### Fixes

- 修复 `generate-iconfont.py` 误跳过 `config` 图标的问题

## 4.0.0-cpp.beta.3

### New Icons

- 新增 `ArrowLeftI` 图标（arrow-left-i）
- 新增 `GiftI` 图标（gift-i）
- 新增 `MoreI` 图标（more-i）
- 新增 `ShareI` 图标（share-i）

## 4.0.0-cpp.beta.2

### New Icons

- 新增 `AlwaysBuyOrder` 图标

### Changes

- 更新 config.json 新增 always-buy-order CDN 地址

## 4.0.0-cpp.beta.0

### Breaking Changes

- 升级 `arrow-left`、`more`、`gift`、`share` 图标为 v16 版本，path data 已替换为新设计稿

### Changes

- 更新 4 个图标的 SVG 源文件为 48x48 viewBox 格式
- 更新 4 个图标的 CDN 地址（鸿蒙端 svgSrc）
- 更新 iconfont 字体文件（.svg/.js/.ttf/.woff/.woff2）
