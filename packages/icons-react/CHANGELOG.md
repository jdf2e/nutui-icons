# Changelog

## [3.1.0-beta.1] - 2026-08-21

### Fixed

- 修正 `sideEffects` 配置，移除错误的 `**/index.es.js` 标记，仅保留 `*.css`，确保 Webpack/Rollup 能正确 tree-shaking re-export 入口

## [3.1.0-beta.0] - 2026-08-21

### Added

- 新增 `exports` 字段，支持 Node 12+ / Vite / Webpack 5 等现代构建工具的 ESM 优先解析，启用 tree-shaking
- 新增 `peerDependencies`，声明对 `react >= 17.0.0` 和 `react-dom >= 17.0.0` 的依赖要求

## [3.0.2] - (previous release)

- 初始发布

## [3.1.0-beta.2] - 2026-08-21

### Added

- README 补充安装说明、属性文档、全局配置和 tree-shaking 使用指引

### Improved

- 类型声明由单一 `index.d.ts` 改为每个图标独立 `.d.ts`（`dist/types/components/*.d.ts`），提升 IDE 自动补全响应速度
