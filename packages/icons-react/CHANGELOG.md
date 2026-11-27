# Changelog

## [3.2.0-beta.0] - 2026-11-27

### Added

- 图标资源升级为 48×48 网格（199 个图标），新增 `AlwaysBuyF`、`GiftOrder`，恢复 `AlwaysBuy`、`MinusF` 导出

### Changed

- 拆分 `dist/style_icon.css` 并按需绑定到 `internal`、`IconFont`、`Loading`/`Loading1`，大幅缩减常规按需引入的 CSS 体积；内置动画类名（`nut-icon-am-*`）拆分至 `dist/style_icon_animate.css`。**迁移提示**：存量使用 `nut-icon-am-*` 动画类或仅通过 `<link>` 引入 `dist/style_icon.css` 的 UMD/CDN 场景，请按需补充引入 `dist/style_icon_animate.css`、`dist/style_icon_loading.css`、`dist/style_icon_img.css`，或直接改引全量 `dist/style_iconfont.css`

### Fixed
- 修复 React 19 兼容问题：ES 构建切换为 automatic JSX runtime（external `react/jsx-runtime`），UMD 构建接入 `jsx-runtime.shim.ts` 垫片（仅依赖 React 全局变量）
- 修复 48×48 网格 SVG 生成逻辑：递归提取 `<g transform>` 内的 `<path>`，跳过 `<defs>/<clipPath>` 裁剪框，保留 `fillRule`/`clipRule="evenodd"` 及 `fillOpacity`/`stroke`/`strokeWidth`/`strokeOpacity` 属性
- `IconFont` 的 props 改为可选，避免使用方必须传入全部属性
- 类型声明 `IconFontConfig` 改为精确的 const 结构类型

## [3.1.0-beta.1] - 2026-08-21

### Fixed

- 修正 `sideEffects` 配置，移除错误的 `**/index.es.js` 标记，仅保留 `*.css`，确保 Webpack/Rollup 能正确 tree-shaking re-export 入口

## [3.1.0-beta.0] - 2026-08-21

### Added

- 新增 `exports` 字段，支持 Node 12+ / Vite / Webpack 5 等现代构建工具的 ESM 优先解析，启用 tree-shaking
- 新增 `peerDependencies`，声明对 `react >= 17.0.0` 和 `react-dom >= 17.0.0` 的依赖要求

## [3.0.2] - (previous release)

- 初始发布
