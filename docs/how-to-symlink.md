# 如何通过软链本地调试

在 nutui-react 项目中使用本地 nutui-icons 构建产物进行调试。

## 步骤

### 1. 构建 icons-react-taro

```bash
cd /Users/tongen/Documents/opensource/nutui-icons/packages/icons-react-taro
npm run build
```

### 2. 替换 nutui-react 中的依赖为软链

```bash
# 删除原有链接（pnpm 的符号链接）
rm /Users/tongen/Documents/opensource/nutui-react/node_modules/@nutui/icons-react-taro

# 创建指向本地包的软链
ln -s /Users/tongen/Documents/opensource/nutui-icons/packages/icons-react-taro \
      /Users/tongen/Documents/opensource/nutui-react/node_modules/@nutui/icons-react-taro
```

### 3. 验证

```bash
ls -la /Users/tongen/Documents/opensource/nutui-react/node_modules/@nutui/icons-react-taro
# 应显示 -> /Users/tongen/Documents/opensource/nutui-icons/packages/icons-react-taro
```

## 注意事项

- 每次在 nutui-react 中执行 `pnpm install` 会覆盖软链，需要重新创建
- 修改 icons 源码后需要重新 `npm run build` 才能在 nutui-react 中生效
- 调试完毕后，在 nutui-react 中重新执行 `pnpm install` 即可恢复正常依赖

## 快捷脚本

可在 nutui-icons 根目录创建一个调试脚本：

```bash
#!/bin/bash
# link-to-nutui-react.sh

cd packages/icons-react-taro && npm run build && cd ../..

rm -f /Users/tongen/Documents/opensource/nutui-react/node_modules/@nutui/icons-react-taro
ln -s $(pwd)/packages/icons-react-taro \
      /Users/tongen/Documents/opensource/nutui-react/node_modules/@nutui/icons-react-taro

echo "Done. Linked icons-react-taro to nutui-react."
```
