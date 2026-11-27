# Changelog

## [3.2.0-beta.0] - 2026-11-27

### Added

- 图标资源升级为 48×48 网格（199 个图标），新增 `AlwaysBuyF`、`GiftOrder`
- 新增微信小程序 Skyline 渲染引擎适配：新增 `IconSkylineTemplate`（基于 `<view>` + `background-image` 动态着色与缓存），导出 `isSkyline()`，支持 `configure({ isSkyline: true })` 与 `process.env.TARO_ENV === 'skyline'` 条件编译
- 图标组件新增无障碍属性：`ariaRole`、`ariaLabel`、`ariaRoledescription`、`ariaHidden`、`ariaChecked`、`ariaSelected`

### Fixed

- 优化按端编译期 Tree-shaking：解耦 `IconTemplate`、`IconHarmonyTemplate`、`IconSkylineTemplate` 三个端模板，将 `defaultProps` 下沉至 `internal.ts`、`isSkyline()` 归入 `IconSkylineTemplate`，关闭 `hoistTransitiveImports` 并显式保留 `process.env.TARO_ENV`
- 修复 React 19 兼容问题：ES 产物 external `react/jsx-runtime`，UMD 产物接入 `jsx-runtime.shim.ts` 垫片并 external `@tarojs/components`
- 修复 Next.js SSR 兼容、iOS 下 SVG 无法展示（`svg64` 回退）、Harmony `pxCheck` 单位处理
- 修复 `iconfont.css` 缺失 `.nut-icon-always-buy` 字形
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
