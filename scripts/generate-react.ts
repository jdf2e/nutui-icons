import { camelCase } from './camelCase';
import glob from 'glob'
import path from 'path'
import fsExtra from 'fs-extra';
import {parse} from 'svg-parser'
import {optimize} from 'svgo'
import consola from "consola";
import svg64 from './svg64';

// 48 网格图标会把 path 包在多层 <g>（带 transform）里，需要递归收集并保留祖先 transform
// <defs>/<clipPath> 等内的 path 不是可见图形（如裁剪框），递归时跳过
const SKIP_TAGS = new Set(['defs', 'clipPath', 'mask', 'symbol', 'style', 'title', 'desc'])
type PathInfo = {
    d: string
    transform: string
    fillRule?: string
    clipRule?: string
    fillOpacity?: string
    stroke?: string
    strokeWidth?: string
    strokeOpacity?: string
    noFill?: boolean
}
const collectPaths = (node: any, transform: string = '', paths: PathInfo[] = []) => {
    if (!node) return paths
    const currentTransform = [transform, node.properties?.transform].filter(Boolean).join(' ')
    if (node.tagName === 'path' && node.properties?.d) {
        const rawFillRule = node.properties['fill-rule']
        const rawClipRule = node.properties['clip-rule']
        const fillRule = typeof rawFillRule === 'string' && rawFillRule.toLowerCase() === 'evenodd' ? 'evenodd' : undefined
        const clipRule = typeof rawClipRule === 'string' && rawClipRule.toLowerCase() === 'evenodd' ? 'evenodd' : undefined
        const fillOpacity = node.properties['fill-opacity'] !== undefined ? String(node.properties['fill-opacity']) : undefined
        const hasStroke = node.properties.stroke !== undefined && node.properties.stroke !== 'none'
        const stroke = hasStroke ? 'currentColor' : undefined
        const strokeWidth = hasStroke && node.properties['stroke-width'] !== undefined ? String(node.properties['stroke-width']) : undefined
        const strokeOpacity = hasStroke && node.properties['stroke-opacity'] !== undefined ? String(node.properties['stroke-opacity']) : undefined
        const noFill = hasStroke && (node.properties.fill === undefined || node.properties.fill === 'none')
        paths.push({ d: node.properties.d, transform: currentTransform, fillRule, clipRule, fillOpacity, stroke, strokeWidth, strokeOpacity, noFill })
    }
    ;(node.children || []).forEach((child: any) => {
        if (!SKIP_TAGS.has(child.tagName)) collectPaths(child, currentTransform, paths)
    })
    return paths
}

const getSvg = (componentName: string, viewBox: string, paths: PathInfo[]) => {
    const template = `
import {FunctionComponent} from 'react'
import Icon, {defaultProps, SVG_IconProps} from '../IconTemplate'

const Add:FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    const realProps = { ...defaultProps, ...props }
    return <Icon {...realProps} name={realProps.name || '${componentName}'} viewBox={'${viewBox}'}>
        ${paths.map(({ d, transform, fillRule, clipRule, fillOpacity, stroke, strokeWidth, strokeOpacity, noFill }) => {
        return `<path
        d="${d}"${transform ? `
        transform="${transform}"` : ''}${fillRule ? `
        fillRule="${fillRule}"` : ''}${clipRule ? `
        clipRule="${clipRule}"` : ''}${fillOpacity ? `
        fillOpacity="${fillOpacity}"` : ''}${stroke ? `
        stroke="${stroke}"` : ''}${strokeWidth ? `
        strokeWidth="${strokeWidth}"` : ''}${strokeOpacity ? `
        strokeOpacity="${strokeOpacity}"` : ''}
        fill="${noFill ? 'none' : 'currentColor'}"
        ></path>`
    }).join('\n        ')}
    </Icon>
}

export default Add
`
    return template
}
const getIconFont = (componentName: string) => {
    const template = `
import IconFont, {IconFontProps} from "../IconFont";
import {FunctionComponent} from "react";

const Icon: FunctionComponent<IconFontProps> = (props: IconFontProps) => {
    return <IconFont {...props} name={props.name || '${componentName}'}/>
}
Icon.displayName = 'NutIcon${componentName}'
export default Icon
`
    return template
}

const getTaroSvg = (componentName: string, svg: string, iconFontName: string, isJdesign: boolean = false) => {
    const svg64String = svg64(svg)
    if (isJdesign) {
        return `
import {FunctionComponent} from 'react'
import Icon, {defaultProps, SVG_IconProps} from '../IconTemplate'

const IconSVG:FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    const realProps = { ...defaultProps, ...props }
    return <Icon {...realProps} name={realProps.name || '${componentName}'} svg64={'${svg64String}'}>
    </Icon>
}

export default IconSVG
`
    }
    const svgSrc = (svgConfig as any)[iconFontName] || ''
    const template = `
import {FunctionComponent} from 'react'
import Icon, { defaultProps, SVG_IconProps } from '../IconTemplate'
import { default as Icon2 } from '../IconHarmonyTemplate'
import { default as Icon3 } from '../IconSkylineTemplate'

const svg64 = '${svg64String}'
const svgSrc = '${svgSrc}'

const IconSVG:FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    const realProps = { ...defaultProps, ...props }
    return (
        <>{process.env.TARO_ENV === 'skyline' ? (
            <Icon3 {...realProps} name={realProps.name || '${componentName}'} svg64={svg64}></Icon3>
        ) : process.env.TARO_ENV !== 'jdharmony_cpp' && process.env.TARO_ENV !== 'dynamic' ? (
            <Icon {...realProps} name={realProps.name || '${componentName}'} svg64={svg64}></Icon>
        ) : (
            <Icon2 {...realProps} name={realProps.name || '${componentName}'} svgSrc={svgSrc} svg64={svg64}></Icon2>
        )}</>
    )
}

export default IconSVG
`
    return template
}

let entryEs = `/** 此文件由 script generate 脚本生成 */
export { config as IconFontConfig } from "./icons/IconFontConfig.js";
export { default as IconFont } from "./icons/IconFont.js";
export { configure } from "./icons/configure.js";
\n`;

let entryEsTaro = `/** 此文件由 script generate 脚本生成 */
export { config as IconFontConfig } from "./icons/IconFontConfig.js";
export { default as IconFont } from "./icons/IconFont.js";
export { configure } from "./icons/configure.js";
export { isSkyline } from "./icons/internal.js";
\n`;

let entryLib = `/** 此文件由 script generate 脚本生成 */
    import IconFont from '../IconFont';
    import { configure } from "../configure";
    import config from '../../../../iconfont/config.json';
    export { IconFont, config, configure };
\n`;
let entryLibDTS = `/** 此文件由 script generate 脚本生成 */
    import IconFont from '../IconFont';
    import { configure } from "../configure";
    export { IconFont, configure  };
\n`;

let entryLibTaro = `/** 此文件由 script generate 脚本生成 */
    import IconFont from '../IconFont';
    import { configure } from "../configure";
    import { isSkyline } from "../internal";
    import config from '../../../../iconfont/config.json';
    export { IconFont, config, configure, isSkyline };
\n`;
let entryLibDTSTaro = `/** 此文件由 script generate 脚本生成 */
    import IconFont from '../IconFont';
    import { configure } from "../configure";
    import { isSkyline } from "../internal";
    export { IconFont, configure, isSkyline };
\n`;

const projectID = process.env.PROJECT_ID
let pattern = `${process.cwd()}/packages/icons-svg/*.svg`;
let iconsReactDir = `icons-react`;
let iconsReactTaroDir = `icons-react-taro`;

if (projectID) {
    entryLib = `/** 此文件由 script generate 脚本生成 */
    import IconFont from '../IconFont';
    import config from '../../../../${projectID}-iconfont/config.json';
    export { IconFont, config };
\n`;

    pattern = `${process.cwd()}/packages/${projectID}-icons-svg/*.svg`;
    iconsReactDir = `${projectID}-icons-react`;
    iconsReactTaroDir = `${projectID}-icons-react-taro`;
}

let svgConfig: Record<string, string> = {}
const svgConfigFile = `${process.cwd()}/packages/icons-svg/config.json`
if (fsExtra.existsSync(svgConfigFile)) {
    try {
        svgConfig = JSON.parse(fsExtra.readFileSync(svgConfigFile, 'utf8'))
    } catch (e) {
        // ignore
    }
}

new glob.Glob(pattern, {},(err, files) => {
    const entryArray: any = []
    files.forEach(file => {
        const basename = path.basename(file)
        const iconFontName = basename.replace('.svg', '')
        const componentName = camelCase(iconFontName, {
            pascalCase: true
        })

        entryArray.push(componentName)
        entryLib += `export { default as ${componentName} } from '../components/${componentName}'\n`
        entryLibTaro += `export { default as ${componentName} } from '../components/${componentName}'\n`
        entryEs += `export { default as ${componentName} } from "./icons/${componentName}.js";\n`;
        entryEsTaro += `export { default as ${componentName} } from "./icons/${componentName}.js";\n`;
        entryLibDTS += `export { default as ${componentName} } from "../components/${componentName}";\n`;
        entryLibDTSTaro += `export { default as ${componentName} } from "../components/${componentName}";\n`;

        fsExtra.readFile(file, {encoding: 'utf8'}).then((res) => {
            let svg = optimize(res).data;
            const svgAST = parse(svg).children[0];
            let paths = collectPaths(svgAST)
            let viewBox = (svgAST as any).properties.viewBox;
            fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactDir}/src/components/${componentName}.tsx`, getSvg(componentName, viewBox, paths), 'utf8', (error) => {
                consola.success(`${iconsReactDir} ${componentName} 文件写入成功`);
            });
            fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/src/components/${componentName}.tsx`, getTaroSvg(componentName, svg, iconFontName, Boolean(projectID)), 'utf8', (error) => {
                consola.success(`${iconsReactTaroDir} svg ${componentName} 文件写入成功`);
            });
        })
    })
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactDir}/src/components/iconsConfig.ts`, `export const iconsConfig = ${JSON.stringify(entryArray)}`, 'utf8', (error) => {
        consola.success(`${iconsReactDir} 文件列表配置写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/src/components/iconsConfig.ts`, `export const iconsConfig = ${JSON.stringify(entryArray)}`, 'utf8', (error) => {
        consola.success(`${iconsReactTaroDir} 文件列表配置写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactDir}/dist/es/index.es.js`, entryEs + 'import "../style_icon.css";', 'utf8', (error) => {
        consola.success(`${iconsReactDir} ES 入口文件文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/dist/es/index.es.js`, entryEsTaro + 'import "../style_icon.css";', 'utf8', (error) => {
        consola.success(`${iconsReactTaroDir} ES 入口文件文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactDir}/src/buildEntry/lib-new.ts`, entryLib, 'utf8', (error) => {
        consola.success(`${iconsReactDir} buildEntry 文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/src/buildEntry/lib-new.ts`, entryLibTaro, 'utf8', (error) => {
        consola.success(`${iconsReactTaroDir} buildEntry 文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactDir}/src/buildEntry/lib-new-dts.ts`, entryLibDTS, 'utf8', (error) => {
        consola.success(`${iconsReactDir} buildEntry dts 文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/src/buildEntry/lib-new-dts.ts`, entryLibDTSTaro, 'utf8', (error) => {
        consola.success(`${iconsReactTaroDir} buildEntry dts 文件写入成功`);
    });
})
