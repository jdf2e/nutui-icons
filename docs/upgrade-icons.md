# upgrade-icons

批量新增/替换 nutui-icons 图标的发布流程。从 ipps GraphQL API 拉取图标数据、缩放 SVG、生成 iconfont 全套文件与 React/Taro 组件，并发布 npm 包。

对应 skill：`/upgrade-icons`。

## 整体顺序

**1 改尺寸 → 2 拉 URL → 3 生成全套（iconfont + 组件）→ 4 发布**

## 前置条件

- 全局安装字体工具：`npm install -g svg2ttf ttf2woff ttf2woff2 ttf2eot`
- 从 API 拉取需有效的 ipps SSO Cookie（关键字段：`sso.jd.com`、`EGG_SESS`、`token`、`ssa.origin-gateway`）
- 工作目录为仓库根 `nutui-icons/`

## 图标后缀体系

- **无后缀** = 3dp 线性（默认）
- **`-i`** = 4dp 线性（更粗）
- **`-f`** = 面性 / filled

同名的 `X`、`X-i`、`X-f` 是同一图标的三种风格变体。写 changelog 时按这三类分组统计。

---

## Step 0：从 API 拉取图标数据

端点 `http://ipps.jd.com/graphql`（POST，需 SSO Cookie，未认证会 302 到 ssa.jd.com）。分页拉取（每页约 11 条，按 `count` 算总页数），按 `imgname` 去重：

```python
import urllib.request, json, math
COOKIE = '...'   # 用户提供
CAT = '...'      # filterCat 分类 ID，用户提供
URL = 'http://ipps.jd.com/graphql'
Q = "query ($page: Int, $filterName: String, $type: String, $filterCat: String, $refresh: String, $filtertype: [FilterTypeInput]) {\n  imagelist(page: $page, filterName: $filterName, type: $type, filterCat: $filterCat, refresh: $refresh, filtertype: $filtertype) {\n    rows { id imgname size url __typename }\n    count __typename\n  }\n}\n"
def fetch(page):
    body = json.dumps({"operationName":None,"variables":{"filterName":"","type":"002","filterCat":CAT,"page":page,"refresh":"_","filtertype":[]},"query":Q}).encode()
    req = urllib.request.Request(URL, data=body, headers={'Content-Type':'application/json','Cookie':COOKIE})
    with urllib.request.urlopen(req, timeout=30) as r: return json.loads(r.read())
all_rows=[]; d0=fetch(0); count=d0['data']['imagelist']['count']; all_rows+=d0['data']['imagelist']['rows']
per=len(d0['data']['imagelist']['rows']); pages=math.ceil(count/per)
for p in range(1,pages): all_rows+=fetch(p)['data']['imagelist']['rows']
uniq={r['imgname'].strip():r for r in all_rows}   # 键带 .svg
```

> ⚠️ **分类 ID 决定 URL——务必让用户确认拉对了分类。** 同一批图标可能挂在多个 `filterCat` 下，URL 不同。曾用错分类 ID 拉到过时 URL，换正确分类后 URL 才对。拉完打印几个 URL 让用户核对。

**下载 SVG（新增文件时）**：从 CDN URL 下载到 `packages/icons-svg/`。部分 CDN 返回 gzip，需先 `gzip.decompress(raw)` 再 decode。

**清理异常文件名**：
- `imgname` 可能含 tab/空格/中文/括号，`strip()` 后处理。
- `live streaming` → `live-streaming`（空格→连字符），文件与 config key 同步改。
- 带括号的重复文件（如 `video-f (1).svg`）删除。

## Step 1：改尺寸（1024 → 48）

API 给的 SVG 通常是 `viewBox="0 0 1024 1024"`，需统一缩放到 `0 0 48 48`。按 48/1024 缩放所有 path 坐标，**arc 命令（A/a）的第 3/4/5 个参数是 flag（旋转角、大弧、扫描），不缩放**：

```python
import os, re
svg_dir = 'packages/icons-svg'
def scale_path_data(d, s):
    toks = re.findall(r'[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?', d)
    out=[]; cmd=''; pi=0
    for t in toks:
        if t.isalpha(): cmd=t; pi=0; out.append(t); continue
        scale = not (cmd in ('A','a') and pi%7 in (2,3,4))
        v=float(t)*s if scale else float(t)
        out.append(str(int(v)) if scale and v==int(v) else (f'{v:.4f}'.rstrip('0').rstrip('.') if scale else t))
        pi+=1
    return ' '.join(out)
for f in sorted(os.listdir(svg_dir)):
    if not f.endswith('.svg'): continue
    p=os.path.join(svg_dir,f); c=open(p).read()
    if 'viewBox="0 0 1024 1024"' not in c: continue
    c=c.replace('viewBox="0 0 1024 1024"','viewBox="0 0 48 48"')
    c=re.sub(r'd="([^"]*)"', lambda m: f'd="{scale_path_data(m.group(1), 48/1024)}"', c)
    open(p,'w').write(c)
```

源 SVG 里的 `fill="#xxx"` 硬编码颜色不用改——组件模板生成时会注入 `fill="currentColor"`。

## Step 2：全量重建 config.json（拉 URL）

`packages/icons-svg/config.json`：key 为**不带 `.svg`** 的文件名，value 为 CDN URL（鸿蒙端 svgSrc 用）。**完全用 API 数据重建并排序，不要 merge 旧条目**（避免残留已删图标）：

```python
import json, os
uniq = json.load(open('/tmp/uniq.json'))  # Step 0 的结果
new = {k[:-4] if k.endswith('.svg') else k: r['url'] for k,r in uniq.items()}
new = {k:new[k] for k in sorted(new)}
json.dump(new, open('packages/icons-svg/config.json','w'), ensure_ascii=False, indent=2)
# 一一对应校验：必须零缺口
svgs={f[:-4] for f in os.listdir('packages/icons-svg') if f.endswith('.svg')}
assert not (svgs - set(new)), f'SVG 缺 URL: {sorted(svgs-set(new))}'
assert not (set(new) - svgs), f'URL 无对应 SVG: {sorted(set(new)-svgs)}'
```

## Step 3：生成 iconfont 全套文件

```bash
python3 scripts/generate-iconfont.py
```

自动完成：
- 读取 `packages/icons-svg/*.svg`
- 生成 `iconfont/iconfont.svg`（1024 单位，Y-up 字体坐标系）
- 生成 `iconfont/iconfont.js`（1024 单位，Y-down，symbol 模式）
- 生成 `iconfont/iconfont.css`（font class 模式）
- 生成 `iconfont/iconfont.ttf/.woff/.woff2/.eot`

码位逻辑：已有图标保留原 unicode 码位并替换 path；新增图标自动分配下一可用码位。

**验证 glyph 数 == SVG 数**（去掉 `nut-icon-` 前缀比对）。若少了图标，检查脚本是否有硬编码 skip（曾有 `if name=="config": continue` 误跳过 `config` 图标，已修复）。可选 `open iconfont/demo_index.html` 肉眼验证三种模式。

## Step 4：生成 React/Taro 组件

```bash
npm run tsnode
```

生成入口 `lib-new.ts` / `lib-new-dts.ts` / `iconsConfig.ts`，以及 `src/components/*.tsx`。

> **关键：`src/components/` 被包级 `.gitignore` 忽略，是构建产物。git 只跟踪 `src/buildEntry/lib-new.ts` 和 `lib-new-dts.ts` 两个入口。**

- 目录里可能有历史遗留的孤儿组件（不在入口 export 里）——**不影响发布，不用手动删**。
- **不要手动删组件文件**。macOS 大小写不敏感，`Qrcode.tsx`/`QrCode.tsx` 是同一物理文件，误删会连带删掉入口需要的组件。若误删，重跑 `npm run tsnode` 恢复。
- 校验：磁盘组件、入口 export、SVG 三者对齐（框架文件 IconFont/configure 等除外）。

**macOS 大小写冲突**（仅当 `qr-code.svg` 和 `qrcode.svg` 同时存在时才发生）：入口会同时 export `QrCode` 和 `Qrcode`，但磁盘只能存一个。删掉其中一个 SVG 源，重新生成。

## Step 5：撤销非目标包变更（按需）

只发 taro 时，撤销 tsnode 同时生成的 react 包入口：

```bash
git checkout -- packages/icons-react/
```

## Step 6：构建目标包

```bash
cd packages/icons-react-taro && npm run build
```

4 步 vite 构建（es/umd/css/dts）。`process`/`env` externalized 是无害提示，非错误。构建后校验 `dist/es/icons/` 覆盖全部图标。

## Step 7：版本号 + changelog

> ⚠️ **定版本号前必须查 npm 已发版本和 git tag，避免冲突和倒退：**

```bash
npm view @nutui/icons-react-taro versions --json    # 看已发布的最高版本
git tag | grep <目标版本>                             # 确认 tag 未占用
npm view @nutui/icons-react-taro@<目标版本> version   # 404 = 可用
```

- 版本号格式 `4.x.x-beta.N`，**不再用 `cpp` 标记**。
- 目标版本必须**高于** npm 已有最高版本。大批量刷新升 minor（如 `4.1.0-beta.0`），小修补升 patch/beta 序号。
- 改 `packages/icons-react-taro/package.json` 的 version（两个包都发时版本号保持一致）。
- `CHANGELOG.md` 顶部加新版本记录，按 3dp/-i/-f 分组统计新增，列出移除的旧图标：

```markdown
## {new-version}

### Breaking Changes
- 移除 N 个旧图标：...

### New Icons
- 新增 N 个图标（3dp X / -i Y / -f Z）

### Changes
- ...
```

## Step 8：提交 / push / tag

在**当前工作分支**直接提交（无需强制新建分支）：

```bash
git add packages/icons-svg/ iconfont/ scripts/ \
        packages/icons-react-taro/package.json \
        packages/icons-react-taro/CHANGELOG.md \
        packages/icons-react-taro/src/buildEntry/
git commit -m "feat: ... 发布 @nutui/icons-react-taro@{version}"

git config http.postBuffer 524288000   # 大量 SVG/字体，防 HTTP 400
git push origin <当前分支>

git tag v{version}
git push origin v{version}
```

## Step 9：npm 发布

```bash
cd packages/icons-react-taro && npm publish --tag beta
# 只发 taro 就不发 react；两个都发时 react 版本号需同步
```

需 npm 登录 + OTP，**让用户自行执行**。发布后核对：

```bash
npm view @nutui/icons-react-taro@{version} version
npm view @nutui/icons-react-taro dist-tags.beta   # 应指向新版本
```

---

## 坐标系说明

| 文件 | viewBox | 坐标系 | 说明 |
|------|---------|--------|------|
| `packages/icons-svg/*.svg` | 0 0 48 48 | Y-down | 组件源文件（缩放后统一 48） |
| `iconfont/iconfont.js` (symbol) | 0 0 1024 1024 | Y-down | 48→1024 缩放 |
| `iconfont/iconfont.svg` (font) | 1024 units | Y-up | 48→1024 缩放 + Y翻转 |

Y翻转公式（ascent=896）：
- 绝对坐标：`Y_font = 896 - Y_svg`
- 相对坐标：`dy_font = -dy_svg`
- arc sweep-flag：`0↔1` 互换

## 关键文件

| 文件 | 作用 | git 跟踪 |
|------|------|------|
| `packages/icons-svg/*.svg` | 图标源文件（48x48） | ✅ |
| `packages/icons-svg/config.json` | 图标 CDN URL 映射（鸿蒙端） | ✅ |
| `scripts/generate-iconfont.py` | 生成 iconfont 全套 | ✅ |
| `scripts/generate-react.ts` | 生成组件（`npm run tsnode`），glob 全部 SVG | ✅ |
| `iconfont/*` | 字体产物（svg/js/css/ttf/woff/woff2/eot） | ✅ |
| `iconfont/config.json` | 图标分类配置（demo 展示用），需手动维护新增分类 | ✅ |
| `packages/*/src/buildEntry/lib-new*.ts` | 组件导出入口 | ✅ |
| `packages/*/src/components/*.tsx` | 组件（构建产物） | ❌ gitignore |

## 注意事项

- 替换图标名称不变时，iconfont 脚本自动保留原 unicode 码位；新增自动分配下一码位。
- 多 path 的 SVG 会合并为单个 glyph。
- `npm run tsnode` 会同时生成 icons-react 和 icons-react-taro，按需 `git checkout --` 撤销。
- 升级后如需评估对下游项目的影响，用 `/check-icon-changes` skill 检测使用方项目的图标变更。
- **发布主线**：改尺寸 → 拉 URL → iconfont → 组件 → 撤销非目标包 → 构建 → 版本/changelog → 提交/push/tag → npm publish。

## 已知问题

| 问题 | 原因 | 解决 |
|------|------|------|
| API 302 到 SSO | Cookie 过期/未携带 | 重新获取 Cookie |
| 拉到的 URL 过时/不对 | filterCat 分类 ID 用错 | 确认分类；打印几个 URL 核对 |
| iconfont 少了图标 | 脚本硬编码 skip | 检查 generate-iconfont.py 的 `continue` |
| 误删组件后入口报缺失 | macOS 大小写 + 手删组件 | 别手删组件；重跑 `npm run tsnode` |
| 版本号发布失败 | npm 已存在该版本/tag 已占用 | 发布前查 npm versions 和 git tag，选更高未占用版本 |
| git push 报 HTTP 400 | 大文件超默认 buffer | `git config http.postBuffer 524288000` |
| npm publish 需 OTP | 双因子认证 | 用户自行执行 |
| SVG 下载解码失败 | CDN 返回 gzip | 先 `gzip.decompress(raw)` 再 decode |
