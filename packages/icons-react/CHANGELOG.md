# Changelog

## [3.1.0-beta.2] - 2026-11-26

### Added

- 图标资源升级为 48×48 网格（199 个图标），新增 `AlwaysBuyF`、`GiftOrder`，恢复 `AlwaysBuy`、`MinusF` 导出

### Fixed

- 修复 React 19 兼容问题：构建切换为 automatic JSX runtime，external `react/jsx-runtime`
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
