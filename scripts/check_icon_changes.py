#!/usr/bin/env python3
"""
check-icon-changes: 检测下游项目使用的 @nutui/icons-react-taro 图标在版本升级中是否发生变更。

对比两个 npm 已发布版本，扫描下游项目源码里实际用到的图标，分类输出：
  🔴 已移除    —— 用到的图标在新版被删（会报错/图标消失）
  🟡 视觉变更  —— 同名图标 SVG 内容变了（还能用，外观不同）
  🟢 无变化
  🆕 新增可用  —— 新版新增的图标（提示可选用）

用法:
  python3 check_icon_changes.py <project_dir> [--old <ver>] [--new <ver>] [--pkg <name>]

默认 pkg=@nutui/icons-react-taro，new=最新已发布版本。
依赖: 系统有 npm（用于 npm pack 下载 tarball）。
"""
import os, re, sys, json, hashlib, subprocess, tempfile, tarfile, argparse

PKG_DEFAULT = '@nutui/icons-react-taro'
FRAME = {'IconFont','IconHarmonyTemplate','IconTemplate','configure','internal',
         'SvgConfig','IconFontConfig','index'}


def sh(cmd, cwd=None):
    return subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)


def download_version(pkg, ver, dest):
    """npm pack 指定版本并解包到 dest，返回解包后的包根目录。"""
    spec = f'{pkg}@{ver}' if ver else pkg
    r = sh(f'npm pack {spec} --pack-destination "{dest}"', cwd=dest)
    if r.returncode != 0:
        raise RuntimeError(f'npm pack {spec} 失败: {r.stderr.strip()}')
    tgz = next((os.path.join(dest, f) for f in os.listdir(dest) if f.endswith('.tgz')), None)
    if not tgz:
        raise RuntimeError(f'未找到 {spec} 的 tarball')
    out = os.path.join(dest, 'pkg')
    os.makedirs(out, exist_ok=True)
    with tarfile.open(tgz) as t:
        t.extractall(out)
    return os.path.join(out, 'package')  # npm tarball 顶层是 package/


def latest_version(pkg):
    r = sh(f'npm view {pkg} version')
    return r.stdout.strip() if r.returncode == 0 else None


def extract_manifest(pkg_root):
    """从 dist/es/icons/*.js 提取 {PascalCase组件名: {name, vhash}}。"""
    icons_dir = os.path.join(pkg_root, 'dist/es/icons')
    man = {}
    if not os.path.isdir(icons_dir):
        return man
    for f in os.listdir(icons_dir):
        if not f.endswith('.js'):
            continue
        comp = f[:-3]
        if comp in FRAME:
            continue
        c = open(os.path.join(icons_dir, f)).read()
        nm = re.search(r'name:\s*realProps\.name\s*\|\|\s*"([^"]+)"', c)
        sv = re.search(r'svg64:\s*"(data:image/svg\+xml;base64,[^"]+)"', c)
        man[comp] = {
            'name': nm.group(1) if nm else comp,
            'vhash': hashlib.md5(sv.group(1).encode()).hexdigest()[:8] if sv else None,
        }
    return man


def extract_kebab(pkg_root):
    """从 style_iconfont.css 提取 kebab 类名集合（IconFont name= 的权威清单）。"""
    css_path = os.path.join(pkg_root, 'dist/style_iconfont.css')
    if not os.path.isfile(css_path):
        return set()
    css = open(css_path).read()
    return set(re.findall(r'\.nut-icon-([a-z0-9-]+):before', css)) or \
           set(re.findall(r'\.nut-icon-([a-z0-9-]+)\b', css))


def scan_project(proj_dir, pkg):
    """扫描源码，返回 (用到的PascalCase组件集合, 用到的kebab-name字符串集合)。"""
    comps, names = set(), set()
    imp_re = re.compile(r'import\s*(?:type\s*)?\{([^}]+)\}\s*from\s*[\'"]' + re.escape(pkg) + r'[\'"]')
    name_re = re.compile(r'<IconFont[^>]*\bname=[\'"]([^\'"]+)[\'"]')
    for root, dirs, files in os.walk(proj_dir):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for fn in files:
            if not fn.endswith(('.tsx', '.ts', '.jsx', '.js')):
                continue
            try:
                src = open(os.path.join(root, fn), encoding='utf-8').read()
            except Exception:
                continue
            for m in imp_re.finditer(src):
                for part in m.group(1).split(','):
                    n = part.strip().split(' as ')[0].strip()
                    if n and n not in ('IconFont', 'configure', 'config'):
                        comps.add(n)
            for m in name_re.finditer(src):
                names.add(m.group(1))
    return comps, names


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project_dir')
    ap.add_argument('--old', help='旧版本号（默认取项目 node_modules 已装版本或让用户指定）')
    ap.add_argument('--new', help='新版本号（默认 npm 最新）')
    ap.add_argument('--pkg', default=PKG_DEFAULT)
    ap.add_argument('--json', action='store_true', help='输出 JSON')
    args = ap.parse_args()

    if not os.path.isdir(args.project_dir):
        sys.exit(f'项目目录不存在: {args.project_dir}')

    new_ver = args.new or latest_version(args.pkg)
    old_ver = args.old
    if not old_ver:
        # 尝试从项目 node_modules 读已装版本
        pj = os.path.join(args.project_dir, 'node_modules', args.pkg, 'package.json')
        if os.path.isfile(pj):
            old_ver = json.load(open(pj)).get('version')
    if not old_ver:
        sys.exit('未指定 --old 且项目未安装该包，无法确定旧版本。请传 --old <ver>。')

    print(f'对比 {args.pkg}:  旧 {old_ver}  →  新 {new_ver}\n扫描项目: {args.project_dir}\n')

    with tempfile.TemporaryDirectory() as tmp:
        old_d = os.path.join(tmp, 'old'); os.makedirs(old_d)
        new_d = os.path.join(tmp, 'new'); os.makedirs(new_d)
        old_root = download_version(args.pkg, old_ver, old_d)
        new_root = download_version(args.pkg, new_ver, new_d)

        old_man, new_man = extract_manifest(old_root), extract_manifest(new_root)
        old_keb, new_keb = extract_kebab(old_root), extract_kebab(new_root)

    added = set(new_man) - set(old_man)
    removed = set(old_man) - set(new_man)
    changed = {c for c in set(new_man) & set(old_man)
               if new_man[c]['vhash'] != old_man[c]['vhash']}

    # 为已移除图标推荐新版替代候选（帮助迁移）
    def comp_kebab(c):
        return re.sub(r'(?<!^)(?=[A-Z])', '-', c).lower()

    new_kebab_map = {comp_kebab(n): n for n in new_man}
    SUFFIX = r'-(fill|f|i|2|3)$'

    def suggest(removed_comp):
        rk = comp_kebab(removed_comp)
        base = re.sub(SUFFIX, '', rk)
        # 1. 同名族：去掉风格后缀后 base 相同的新图标（heart-fill -> heart-f/heart/heart-i）
        fam = [nn for nk, nn in new_kebab_map.items()
               if re.sub(SUFFIX, '', nk) == base]
        if fam:
            return sorted(fam)
        # 2. 模糊兜底
        import difflib
        return [new_kebab_map[k] for k in
                difflib.get_close_matches(rk, new_kebab_map.keys(), n=3, cutoff=0.6)]

    migration = {r: suggest(r) for r in removed}

    # 组件名 -> kebab（用 manifest 的 name 字段兜底；kebab 权威来自 css）
    used_comps, used_names = scan_project(args.project_dir, args.pkg)

    # PascalCase 组件名 -> kebab 的转换（Add->add, AddI->add-i, AddToCartF->add-to-cart-f）
    def comp_to_kebab(c):
        return re.sub(r'(?<!^)(?=[A-Z])', '-', c).lower()

    # kebab -> 组件名（借助 css kebab 集合 + 转换双向校验，两版合并）
    keb2comp = {}
    for c in list(new_man) + list(old_man):
        keb2comp[comp_to_kebab(c)] = c

    used = set(used_comps)
    unresolved = []
    for nm in used_names:
        # name 可能是 kebab（IconFont 字体类名，最常见）或直接 PascalCase 组件名
        if nm in new_man or nm in old_man:
            used.add(nm)
        elif nm in keb2comp:
            used.add(keb2comp[nm])
        elif nm in new_keb or nm in old_keb:
            # 合法 kebab 但转换对不上组件（个别数字/特殊名），仍按 kebab 归类到 removed/ok
            used.add(f'kebab:{nm}')
        else:
            unresolved.append(nm)

    # kebab: 前缀项也参与 removed/ok 判断（用 css 集合）
    def is_removed(u):
        if u in removed:
            return True
        if isinstance(u, str) and u.startswith('kebab:'):
            k = u[6:]
            return k in old_keb and k not in new_keb
        return False

    def is_ok(u):
        if u in new_man and u not in changed:
            return True
        if isinstance(u, str) and u.startswith('kebab:'):
            return u[6:] in new_keb
        return False

    r_removed = sorted(u for u in used if is_removed(u))
    r_changed = sorted(u for u in used if u in changed)
    r_ok = sorted(u for u in used if is_ok(u) and not is_removed(u))
    r_kebab = sorted(u for u in used if isinstance(u, str) and u.startswith('kebab:'))

    if args.json:
        print(json.dumps({
            'old': old_ver, 'new': new_ver,
            'stats': {'added': len(added), 'removed': len(removed), 'changed': len(changed)},
            'used_removed': r_removed, 'used_changed': r_changed, 'used_ok': r_ok,
            'unresolved_names': unresolved, 'added_available': sorted(added),
            'migration': {u: migration.get(u, []) for u in r_removed if not u.startswith('kebab:')},
        }, ensure_ascii=False, indent=2))
        return

    print(f'库整体差异:  🆕 新增 {len(added)}   🔴 移除 {len(removed)}   🟡 视觉变更 {len(changed)}')
    print(f'项目共用到 {len(used)} 个图标\n' + '=' * 50)

    print(f'\n🔴 已移除（升级后会报错/图标消失，需迁移）: {len(r_removed)}')
    for u in r_removed:
        if u.startswith('kebab:'):
            k = u[6:]
            cand = suggest(keb2comp.get(k, k))
            tip = f'  → 建议改用: {cand}' if cand else '  → 无明显候选，需人工确认'
            print(f'   - IconFont name="{k}"  (字体图标，新版已无此类名){tip}')
        else:
            cand = migration.get(u, [])
            tip = f'  → 建议改用: {cand}' if cand else '  → 无明显候选，需人工确认'
            print(f'   - {u}  (name="{old_man[u]["name"]}"){tip}')
    print(f'\n🟡 视觉变更（仍可用，但外观已改，需回归确认）: {len(r_changed)}')
    for u in r_changed:
        print(f'   - {u}')
    print(f'\n🟢 无变化: {len(r_ok)}')
    if r_ok:
        print('   ' + ', '.join(u[6:] if u.startswith('kebab:') else u for u in r_ok))
    if unresolved:
        print(f'\n⚪ 无法识别的 name（可能是动态拼接或非本库图标）: {sorted(unresolved)}')

    if r_removed:
        print('\n❗ 存在已移除图标，升级前必须替换，否则构建/运行报错。')
    elif r_changed:
        print('\n⚠️  无移除项，但有视觉变更，建议 UI 回归。')
    else:
        print('\n✅ 用到的图标均无破坏性变更。')


if __name__ == '__main__':
    main()
