# 如何打 Tag

## 基本流程

```bash
# 1. 确保代码已提交
git add <files>
git commit -m "release: @nutui/icons-react-taro x.x.x"

# 2. 创建 tag
git tag v3.0.2

# 3. 推送 commit 和 tag 到远程
git push origin <branch>
git push origin v3.0.2
```

## 常用命令

```bash
# 查看所有 tag
git tag

# 查看某个 tag 详情
git show v3.0.2

# 创建带注释的 tag
git tag -a v3.0.2 -m "release: v3.0.2"

# 删除本地 tag
git tag -d v3.0.2

# 删除远程 tag
git push origin --delete v3.0.2

# 基于历史 commit 打 tag
git tag v3.0.2 <commit-hash>
```

## 本项目约定

- Tag 命名：`v{version}`，如 `v3.0.2`
- 打 tag 前先提交版本号变更（package.json）
- 推送时 commit 和 tag 分开推：先 `git push origin <branch>`，再 `git push origin <tag>`
