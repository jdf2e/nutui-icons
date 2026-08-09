<p align="center">
   <img alt="logo" src="https://img11.360buyimg.com/imagetools/jfs/t1/211965/25/7152/22022/61b16785E433119bb/aa41d7a9f7e823f3.png" width="150" style="margin-bottom: 10px;">
</p>

NutUI Icons 是统一生产、管理 NutUI 各框架的 Icons 组件资源的仓库。

## Packages

- Vue: [@nutui/icons-vue](./packages/icons-vue) [![NPM version](https://img.shields.io/npm/v/@nutui/icons-vue.svg?style=flat)](https://npmjs.org/package/@nutui/icons-vue) [![NPM downloads](http://img.shields.io/npm/dm/@nutui/icons-vue.svg?style=flat)](https://npmjs.org/package/@nutui/icons-vue)
- Vue-Taro: [@nutui/icons-vue-taro](./packages/icons-vue) [![NPM version](https://img.shields.io/npm/v/@nutui/icons-vue-taro.svg?style=flat)](https://npmjs.org/package/@nutui/icons-vue-taro) [![NPM downloads](http://img.shields.io/npm/dm/@nutui/icons-vue-taro.svg?style=flat)](https://npmjs.org/package/@nutui/icons-vue-taro)
- React: [@nutui/icons-react](./packages/icons-react) [![NPM version](https://img.shields.io/npm/v/@nutui/icons-react.svg?style=flat)](https://npmjs.org/package/@nutui/icons-react) [![NPM downloads](http://img.shields.io/npm/dm/@nutui/icons-react.svg?style=flat)](https://npmjs.org/package/@nutui/icons-react)
- React-Taro: `建设中`
- React Native: `建设中`

## 联动验证

升级 icon 后，可自动验证对 `nutui-react` 的兼容性（需将 `nutui-react` 放在同级目录）。

### 使用方式

```bash
# 生成图标 + 自动联动验证（推荐）
npm run generate:verify

# 仅执行联动验证（已 generate 过的情况）
npm run verify
```

### 验证内容

| 步骤 | 说明 |
|------|------|
| 构建 icons-react | 确保图标组件可正常编译 |
| 构建 icons-react-taro | 确保 Taro 端图标组件可正常编译 |
| H5 类型检查 | 验证 nutui-react 中所有 icon 引用的 TypeScript 类型正确 |
| Taro 类型检查 | 验证 Taro 端 icon 引用的 TypeScript 类型正确 |
| 单元测试 | 运行 nutui-react 的测试套件，确保 icon 变更不破坏组件行为 |

### 前提条件

```
opensource/
├── nutui-icons/      ← 当前项目
└── nutui-react/      ← 同级目录下存在 nutui-react
```

验证脚本会自动 `pnpm link` 本地构建产物到 `nutui-react`，验证完成后自动清理恢复。

## 开源协议

[MIT License](./LICENSE)
