# @nutui/icons-react-taro Changelog

## 4.0.0-beta.0

### Changes

- 将所有 SVG 图标从 1024x1024 缩放到 48x48 viewBox
- 从新分类 `b68009b0-98ab-11f1-b569-79190d19cebf` 更新全量 443 个图标的 CDN URL
- 文件名规范化：`Config-i.svg` → `config-i.svg`，`Config.svg` → `config.svg`，`PK-f.svg` → `pk-f.svg`
- 删除 `qrcode.svg` 以解决 macOS 大小写冲突（保留 `qr-code.svg` → `QrCode` 和 `qrcode-i.svg` → `QrcodeI`）
- `config.json` 按字母排序（不区分大小写）
- 新增测试页面 `demo.html`，支持 Base64 SVG 和 CDN URL 两种渲染模式

## 4.0.0-cpp.beta.3

### New Icons

- 新增 `RankingF` 图标
- 新增 `AddHome` / `AddHomeI` 图标
- 新增 245 个图标 CDN URL 配置

### Changes

- 更新 config.json 全量 CDN 地址（新增 245 个，更新 131 个）
- 修复 live-streaming 系列图标文件名空格问题

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
