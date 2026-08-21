# npm 包质量优化分析

> 分析维度：从包使用者视角审视当前各 package 的设计问题与改进空间。
> 当前范围：仅针对 `@nutui/icons-react` 和 `@nutui/icons-react-taro`。

---

## 优先级排序 & 进度

| 优先级 | 问题 | 影响范围 | 状态 |
|---|---|---|---|
| P0 | 补充 `exports` 字段 | tree-shaking、子路径导入 | ✅ 3.1.0-beta.0 |
| P0 | 补充 `peerDependencies` | 版本冲突告警 | ✅ 3.1.0-beta.0 |
| P1 | 修正 `sideEffects` | tree-shaking 正确性 | ✅ 3.1.0-beta.1 |
| P2 | 类型文件按图标拆分 | IDE 性能 | ✅ 3.1.0-beta.2 |
| P2 | ESM 文件扩展名规范 | Node 原生 ESM 兼容 | 🔲 待处理 |
| P3 | UMD 文档说明 | 用户认知 | ✅ 3.1.0-beta.2 |

---

## 1. ✅ 缺少 `exports` 字段（子路径导出）

**现状**

除 `icons-vue` 外，其余包均无 `exports` 字段，只有老旧的 `main` / `module`。

**影响**
- Node 12+ / Bundler（Vite、Rollup、Webpack 5）优先读取 `exports`，缺少时降级到 `main`，会绕过 ESM 构建，直接引入 UMD，tree-shaking 失效。

**修复（3.1.0-beta.0）**

```json
"exports": {
  ".": {
    "types": "./dist/types/index.d.ts",
    "import": "./dist/es/index.es.js",
    "require": "./dist/lib/index.umd.js"
  },
  "./*": "./*"
}
```

---

## 2. ✅ 缺少 `peerDependencies`

**现状**

`react`、`react-dom` 只出现在 `devDependencies`，安装时无版本冲突提示。

**修复（3.1.0-beta.0）**

```json
"peerDependencies": {
  "react": ">=17.0.0",
  "react-dom": ">=17.0.0"
}
```

---

## 3. ✅ `sideEffects` 配置不精确

**现状**

```json
"sideEffects": ["*.css", "**/index.es.js"]
```

`index.es.js` 被错误标记为有副作用，Webpack/Rollup 不会对其做 tree-shaking，导致引入 1 个图标却打包全部 200+ 图标。`index.es.js` 实际只是 re-export，无任何副作用。

**修复（3.1.0-beta.1）**

```json
"sideEffects": ["*.css"]
```

---

## 4. 🔲 类型声明只有一个入口文件（`index.d.ts`）

**现状**

`dist/types/` 下只有一个扁平的 `index.d.ts`，内含所有图标的 `declare`。

**影响**
- IDE 自动补全需加载整个 `index.d.ts`（400+ 组件），响应变慢。
- 无法利用 `exports["./icons/*"]` 做按需类型推导。

**建议**

修改 `vite.config.dts.ts`，关闭 `rollupTypes`，生成每个图标的独立 `.d.ts`（`dist/types/icons/Add.d.ts`），配合子路径导出。

---

## 5. 🔲 ES 产物扩展名规范

**现状**

`vite.config.build.es.ts` 输出 `entryFileNames: '[name].js'`，但内容为 ESM，且包未声明 `"type":"module"`，在 Node 原生 ESM 场景下易混淆。

**建议**

统一输出 `.mjs` 扩展名，或在 `package.json` 添加 `"type": "module"`，与 `exports.import` 条件语义对齐。

---

## 6. 🔲 UMD 文档说明

**现状**

`dist/lib/index.umd.js` 为全量 bundle（143KB），文档未区分 ESM / UMD 使用场景。

**建议**

在 README 中明确标注 ESM 才支持 tree-shaking，UMD 仅供 `<script>` CDN 场景使用。
