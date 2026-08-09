#!/usr/bin/env python3
"""
批量从 packages/icons-svg/*.svg (48x48) 生成 iconfont 相关文件：
  - iconfont/iconfont.svg   (SVG 字体, 1024 单位, Y-up 坐标系)
  - iconfont/iconfont.js    (Symbol 引用, 1024 单位, Y-down 坐标系)
  - iconfont/iconfont.css   (Font class 样式)
  - iconfont/iconfont.ttf/.woff/.woff2/.eot (字体二进制, 由 svg2ttf 等工具生成)

用法:
  python3 scripts/generate-iconfont.py

前置条件:
  npm install -g svg2ttf ttf2woff ttf2woff2 ttf2eot
"""

import os
import re
import json
import subprocess
from pathlib import Path

# === 配置 ===
ROOT = Path(__file__).resolve().parent.parent
ICONS_SVG_DIR = ROOT / "packages" / "icons-svg"
ICONFONT_DIR = ROOT / "iconfont"
ICONFONT_SVG = ICONFONT_DIR / "iconfont.svg"
ICONFONT_JS = ICONFONT_DIR / "iconfont.js"
ICONFONT_CSS = ICONFONT_DIR / "iconfont.css"

FONT_FAMILY = "nutui-iconfont"
CSS_PREFIX = "nut-icon-"
ASCENT = 896
DESCENT = -128
UNITS_PER_EM = 1024
SCALE_FACTOR = UNITS_PER_EM / 48  # 48 -> 1024


# === 工具函数 ===

def parse_svg_paths(svg_content):
    """从 SVG 内容中提取所有 path 的 d 属性"""
    return re.findall(r'<path[^>]*\bd="([^"]+)"', svg_content)


def scale_svg_path(d, factor):
    """缩放 SVG path data, 正确处理 arc 命令的 flag 参数"""
    tokens = re.findall(r'[a-zA-Z]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?', d)
    result = []
    i = 0
    current_cmd = None
    arg_index = 0

    while i < len(tokens):
        token = tokens[i]
        if re.match(r'^[a-zA-Z]$', token):
            current_cmd = token
            arg_index = 0
            result.append(token)
            i += 1
            continue

        num = float(token)

        if current_cmd and current_cmd.lower() == 'a':
            param_pos = arg_index % 7
            if param_pos in (2, 3, 4):
                result.append(token)
            else:
                scaled = num * factor
                result.append(format_number(scaled))
            arg_index += 1
        elif current_cmd and current_cmd.lower() == 'z':
            result.append(token)
        else:
            scaled = num * factor
            result.append(format_number(scaled))
            arg_index += 1
        i += 1

    return reconstruct_path(result)


def flip_y_path(d, ascent):
    """
    将 SVG path 从 Y-down 坐标系转换为字体 Y-up 坐标系
    绝对坐标: Y' = ascent - Y
    相对坐标: dy' = -dy
    """
    tokens = re.findall(r'[a-zA-Z]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?', d)
    result = []
    i = 0
    current_cmd = None
    arg_index = 0

    while i < len(tokens):
        token = tokens[i]
        if re.match(r'^[a-zA-Z]$', token):
            current_cmd = token
            arg_index = 0
            result.append(token)
            i += 1
            continue

        num = float(token)

        if current_cmd is None:
            result.append(token)
            i += 1
            continue

        is_relative = current_cmd.islower()
        cmd_lower = current_cmd.lower()

        if cmd_lower == 'h':
            # Horizontal: no Y
            result.append(format_number(num))
            arg_index += 1
        elif cmd_lower == 'v':
            # Vertical: flip Y
            if is_relative:
                result.append(format_number(-num))
            else:
                result.append(format_number(ascent - num))
            arg_index += 1
        elif cmd_lower == 'a':
            # Arc: rx ry x-rotation large-arc sweep-flag x y
            param_pos = arg_index % 7
            if param_pos == 1:  # ry - no flip for radius
                result.append(format_number(num))
            elif param_pos == 6:  # y
                if is_relative:
                    result.append(format_number(-num))
                else:
                    result.append(format_number(ascent - num))
            elif param_pos == 4:  # sweep-flag: flip
                result.append('1' if token == '0' else '0')
            else:
                result.append(format_number(num) if param_pos in (0, 5) else token)
            arg_index += 1
        elif cmd_lower in ('m', 'l', 't'):
            # x, y pairs
            param_pos = arg_index % 2
            if param_pos == 1:  # y
                if is_relative:
                    result.append(format_number(-num))
                else:
                    result.append(format_number(ascent - num))
            else:  # x
                result.append(format_number(num))
            arg_index += 1
        elif cmd_lower == 'c':
            # x1 y1 x2 y2 x y
            param_pos = arg_index % 6
            if param_pos in (1, 3, 5):  # y values
                if is_relative:
                    result.append(format_number(-num))
                else:
                    result.append(format_number(ascent - num))
            else:  # x values
                result.append(format_number(num))
            arg_index += 1
        elif cmd_lower == 's' or cmd_lower == 'q':
            # x1 y1 x y (s) or x1 y1 x y (q)
            param_pos = arg_index % 4
            if param_pos in (1, 3):  # y values
                if is_relative:
                    result.append(format_number(-num))
                else:
                    result.append(format_number(ascent - num))
            else:
                result.append(format_number(num))
            arg_index += 1
        elif cmd_lower == 'z':
            result.append(token)
            arg_index += 1
        else:
            result.append(format_number(num))
            arg_index += 1

        i += 1

    return reconstruct_path(result)


def format_number(n):
    """格式化数字,去除多余小数位"""
    if n == int(n):
        return str(int(n))
    formatted = f"{n:.2f}".rstrip('0').rstrip('.')
    return formatted


def reconstruct_path(tokens):
    """从 token 列表重建 path 字符串"""
    output = ''
    for tok in tokens:
        if re.match(r'^[a-zA-Z]$', tok):
            if output and output[-1].lower() == 'z':
                output += ' '
            output += tok
        else:
            if output and not output[-1].isalpha() and not output.endswith(' '):
                if tok.startswith('-'):
                    output += tok
                else:
                    output += ' ' + tok
            else:
                output += tok
    return output


def get_existing_unicode_map():
    """从现有 iconfont.svg 解析 glyph-name -> unicode 映射"""
    mapping = {}
    if ICONFONT_SVG.exists():
        content = ICONFONT_SVG.read_text(encoding='utf-8')
        for match in re.finditer(r'glyph-name="nut-icon-([^"]+)"\s+unicode="&#x([^;]+);"', content):
            name = match.group(1)
            code = match.group(2)
            mapping[name] = code
    return mapping


def get_next_unicode(existing_map):
    """获取下一个可用的 unicode 码位"""
    if not existing_map:
        return 0xe001
    max_code = max(int(code, 16) for code in existing_map.values())
    return max_code + 1


def generate_iconfont_svg(icons, unicode_map):
    """生成 iconfont.svg 字体文件"""
    glyphs = []
    for name, data in sorted(icons.items(), key=lambda x: x[0]):
        unicode_code = unicode_map[name]
        font_path = data['font_path']
        glyphs.append(
            f'          <glyph glyph-name="nut-icon-{name}" '
            f'unicode="&#x{unicode_code};" '
            f'd="{font_path}" '
            f'horiz-adv-x="1024" vert-adv-y="1024" />'
        )

    svg = f'''<?xml version="1.0" standalone="no"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg xmlns="http://www.w3.org/2000/svg">
      <metadata>Copyright (C) 2019 by original authors @ master Gao</metadata>
      <defs>
        <font id="{FONT_FAMILY}" horiz-adv-x="1024" vert-adv-y="1024" >
          <font-face font-family="{FONT_FAMILY}" font-weight="500" font-stretch="normal" units-per-em="1024" ascent="896" descent="-128" />
          <missing-glyph />
{chr(10).join(glyphs)}
        </font>
      </defs>
    </svg>'''
    return svg


def generate_iconfont_js(icons, unicode_map):
    """生成 iconfont.js (symbol 模式)"""
    symbols = []
    for name, data in sorted(icons.items(), key=lambda x: x[0]):
        svg_path = data['svg_path_1024']
        # 可能有多个 path
        paths = ''.join(f'<path d="{p}" fill="#171a26"></path>' for p in data['svg_paths_1024'])
        symbols.append(
            f'<symbol id="nut-icon-{name}" viewBox="0 0 1024 1024">{paths}</symbol>'
        )

    js = f'''  (function (document) {{
var symbols = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">{''.join(symbols)}</svg>'
    document.body.insertAdjacentHTML('afterBegin', symbols)
  }})(document);'''
    return js


def generate_iconfont_css(icons, unicode_map):
    """生成 iconfont.css"""
    lines = [f'''
@font-face {{
  font-family: '{FONT_FAMILY}';
  src: url('iconfont.woff2') format('woff2') /* chrome、firefox */,
  url('iconfont.woff') format('woff') /* chrome、firefox */,
  url('iconfont.ttf') format('truetype') /* chrome、firefox、opera、Safari, Android, iOS 4.2+ */;
}}

.{FONT_FAMILY}{{
  font-family: '{FONT_FAMILY}';
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}}
''']

    for name in sorted(icons.keys()):
        unicode_code = unicode_map[name]
        lines.append(f'''.{CSS_PREFIX}{name}::before {{
  content: "\\{unicode_code}";
}}
''')

    return '\n'.join(lines)


def generate_font_binaries():
    """从 iconfont.svg 生成 .ttf/.woff/.woff2/.eot"""
    svg_path = str(ICONFONT_SVG)
    ttf_path = str(ICONFONT_DIR / "iconfont.ttf")
    woff_path = str(ICONFONT_DIR / "iconfont.woff")
    woff2_path = str(ICONFONT_DIR / "iconfont.woff2")
    eot_path = str(ICONFONT_DIR / "iconfont.eot")

    print("  生成 TTF...")
    subprocess.run(["svg2ttf", svg_path, ttf_path], check=True)

    print("  生成 WOFF...")
    subprocess.run(["ttf2woff", ttf_path, woff_path], check=True)

    print("  生成 WOFF2...")
    with open(ttf_path, 'rb') as ttf_in:
        result = subprocess.run(["npx", "ttf2woff2"], stdin=ttf_in,
                                capture_output=True)
    with open(woff2_path, 'wb') as f:
        f.write(result.stdout)

    print("  生成 EOT...")
    subprocess.run(["ttf2eot", ttf_path, eot_path], check=True)


def main():
    print("=" * 60)
    print("批量生成 iconfont 文件")
    print("=" * 60)

    # 1. 读取现有 unicode 映射
    existing_map = get_existing_unicode_map()
    print(f"\n现有图标: {len(existing_map)} 个")

    # 2. 扫描 icons-svg 目录
    svg_files = sorted(ICONS_SVG_DIR.glob("*.svg"))
    print(f"icons-svg 目录: {len(svg_files)} 个 SVG 文件")

    # 3. 解析每个 SVG, 生成 1024 坐标和字体坐标
    unicode_map = dict(existing_map)
    next_code = get_next_unicode(existing_map)
    icons = {}
    new_count = 0
    replace_count = 0

    for svg_file in svg_files:
        name = svg_file.stem
        if name == "config":
            continue

        content = svg_file.read_text(encoding='utf-8')
        paths_48 = parse_svg_paths(content)
        if not paths_48:
            print(f"  [跳过] {name}: 未找到 path")
            continue

        # 缩放 48 -> 1024 (SVG 坐标系, Y-down)
        paths_1024 = [scale_svg_path(p, SCALE_FACTOR) for p in paths_48]

        # Y-flip: SVG Y-down -> Font Y-up
        font_paths = [flip_y_path(p, ASCENT) for p in paths_1024]
        font_path_combined = ' '.join(font_paths)

        # 分配 unicode
        if name not in unicode_map:
            unicode_map[name] = f"{next_code:04x}"
            next_code += 1
            new_count += 1
        else:
            replace_count += 1

        icons[name] = {
            'svg_paths_1024': paths_1024,
            'svg_path_1024': paths_1024[0] if len(paths_1024) == 1 else ' '.join(paths_1024),
            'font_path': font_path_combined,
        }

    print(f"\n处理结果: 替换 {replace_count} 个, 新增 {new_count} 个")
    print(f"总计: {len(icons)} 个图标")

    # 4. 生成文件
    print("\n生成 iconfont.svg...")
    ICONFONT_SVG.write_text(generate_iconfont_svg(icons, unicode_map), encoding='utf-8')

    print("生成 iconfont.js...")
    ICONFONT_JS.write_text(generate_iconfont_js(icons, unicode_map), encoding='utf-8')

    print("生成 iconfont.css...")
    ICONFONT_CSS.write_text(generate_iconfont_css(icons, unicode_map), encoding='utf-8')

    print("生成字体二进制文件...")
    generate_font_binaries()

    print("\n" + "=" * 60)
    print("完成!")
    print("=" * 60)
    print(f"\n生成文件:")
    print(f"  - {ICONFONT_SVG}")
    print(f"  - {ICONFONT_JS}")
    print(f"  - {ICONFONT_CSS}")
    print(f"  - {ICONFONT_DIR}/iconfont.ttf")
    print(f"  - {ICONFONT_DIR}/iconfont.woff")
    print(f"  - {ICONFONT_DIR}/iconfont.woff2")
    print(f"  - {ICONFONT_DIR}/iconfont.eot")
    print(f"\n下一步:")
    print(f"  1. 打开 iconfont/demo_index.html 验证")
    print(f"  2. 运行 npm run tsnode 生成 React 组件")


if __name__ == "__main__":
    main()
