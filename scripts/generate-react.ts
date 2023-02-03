import {camelCase} from './camelcase'
import glob from 'glob'
import path from 'path'
import fsExtra from 'fs-extra';
import {parse} from 'svg-parser'
import {optimize} from 'svgo'
import consola from "consola";

const getSvg = (compoentName: string, viewBox: string, d: any[]) => {
    const template = `
import classnames from 'classnames'

interface IconProps {
    className?: string
    style?: React.CSSProperties
    name: string
    color?: string
    width?: string | number
    height?: string | number
    onClick: (event: React.MouseEvent) => void
}

const defaultProps = {
    className: '',
    style: undefined,
    name: '',
    width: '',
    height: '',
    onClick: () => undefined
} as IconProps

const ${compoentName} = (props: IconProps) => {
    const {className, style, name, color, width, height, onClick} = {...defaultProps, ...props}
    const handleClick: React.MouseEventHandler = (e) => {
        onClick && onClick(e)
    }
    const pxCheck = (value: string | number): string => {
        return isNaN(Number(value)) ? String(value) : value + "px";
    };
    const classes = () => {
        const prefixCls = "nut-icon";
        return classnames({
            [\`\${className}\`]: className,
            [prefixCls]: true,
            [prefixCls + "-" + name]: name,
        })
    };
    const getStyle = () => {
        return {
            ...style,
            height: pxCheck(height || ''),
            width: pxCheck(width || '')
        }
    }
    return <>
        <svg
            className={classes()}
            style={getStyle()}
            onClick={handleClick}
            xmlns="http://www.w3.org/2000/svg"
            color={color}
            viewBox="${viewBox}"
            aria-labelledby={name}
            role="presentation"
        >
            ${d.map(d => {
        return `<path
        d="${d}"
        fill="currentColor"
        fill-opacity="0.9"
        ></path>`
    })}
        </svg>
    </>
}
${compoentName}.defaultProps = defaultProps
export default ${compoentName}
`
    return template
}
const getIconFont = (compoentName: string) => {
    const template = `
import React, { ReactElement, ReactHTML } from 'react'

export interface IconProps {
    name: string
    size: string | number
    classPrefix: string
    color: string
    tag: keyof ReactHTML
    onClick: (e: MouseEvent) => void
    fontClassName: string
    className: string
    style: React.CSSProperties
    children: React.ReactNode
}

const defaultProps = {
    name: '${compoentName}',
    size: '',
    classPrefix: 'nut-icon',
    fontClassName: 'nutui-iconfont',
    color: '',
    tag: 'i',
    onClick: (e: MouseEvent) => {},
    className: '',
} as IconProps

function pxCheck(value: string | number): string {
    return Number.isNaN(Number(value)) ? String(value) : \`\${value}px\`
}

export default function Icon<T>(props: Partial<IconProps> & T): ReactElement {
    const {
        name,
        size,
        classPrefix,
        color,
        tag,
        children,
        className,
        fontClassName,
        style,
        onClick,
        ...rest
    } = {
        ...defaultProps,
        ...props,
    }
    const isImage = name ? name.indexOf('/') !== -1 : false
    const type = isImage ? 'img' : tag

    const handleClick = (e: MouseEvent) => {
        if (onClick) {
            onClick(e)
        }
    }
    const hasSrc = () => {
        if (isImage) return { src: name }
        return {}
    }
    return React.createElement<any>(
        type,
        {
            className: isImage
                ? \`nut-icon__img \${className || ''} \`
                : \`\${fontClassName} nut-icon \${classPrefix}-\${name} \${className || ''}\`,
            style: {
                color,
                fontSize: pxCheck(size),
                width: pxCheck(size),
                height: pxCheck(size),
                ...style,
            },
            ...rest,
            onClick: handleClick,
            ...hasSrc(),
        },
        children
    )
}

Icon.defaultProps = defaultProps
Icon.displayName = 'NutIcon${compoentName}'
`
    return template
}
let entryEs = `/** 此文件由 script generate 脚本生成 */
export { config as IconFontConfig } from "./icons/IconFontConfig.js";
export { default as IconFont } from "./icons/IconFont.js";
\n`;

let entryLib = `/** 此文件由 script generate 脚本生成 */
    import IconFont from '../IconFont';
    import config from '../../../../iconfont/config.json';
    export { IconFont, config };
\n`;
let entryLibDTS = `/** 此文件由 script generate 脚本生成 */
    import IconFont from '../IconFont';
    export { IconFont  };
\n`;

const pattern = `${process.cwd()}/packages/icons-svg/*.svg`;
new glob.Glob(pattern, {},(err, files) => {
    const entryArray: any = []
    files.forEach(file => {
        const basename = path.basename(file)
        const iconFontName = basename.replace('.svg', '')
        const componentName = camelCase(iconFontName, {
            pascalCase: true
        })

        entryArray.push(componentName)
        entryLib += `export { default as ${componentName} }  from '../components/${componentName}'\n`
        entryEs += `export { default as ${componentName} } from "./icons/${componentName}.js";\n`;
        entryLibDTS += `export { default as ${componentName} } from "../components/${componentName}";\n`;

        fsExtra.readFile(file, {encoding: 'utf8'}).then((res) => {
            let svg = optimize(res).data;
            const svgAST = parse(svg).children[0];
            let pathds = (svgAST as any).children?.map((item:any) => {
                return item.properties.d;
            })
            let viewBox = (svgAST as any).properties.viewBox;

            fsExtra.outputFile(`${process.cwd()}/packages/icons-react/src/components/${componentName}.tsx`, getSvg(componentName, viewBox, pathds), 'utf8', (error) => {
                consola.success(`${componentName} 文件写入成功`);
            });

        })

        fsExtra.outputFile(`${process.cwd()}/packages/icons-react-taro/src/components/${componentName}.tsx`, getIconFont(iconFontName), 'utf8', (error) => {
            consola.success(`${componentName} 文件写入成功`);
        });
    })
    fsExtra.outputFile(`${process.cwd()}/packages/icons-react/src/components/iconsConfig.ts`, `export const iconsConfig = ${JSON.stringify(entryArray)}`, 'utf8', (error) => {
        consola.success(`icons-react 文件列表配置写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/icons-react-taro/src/components/iconsConfig.ts`, `export const iconsConfig = ${JSON.stringify(entryArray)}`, 'utf8', (error) => {
        consola.success(`icons-react-taro 文件列表配置写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/icons-react/dist/es/index.es.js`, entryEs + 'import "../style_icon.css";', 'utf8', (error) => {
        consola.success(`icons-react ES 入口文件文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/icons-react-taro/dist/es/index.es.js`, entryEs + 'import "../style_icon.css";', 'utf8', (error) => {
        consola.success(`icons-react-taro ES 入口文件文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/icons-react/src/buildEntry/lib-new.ts`, entryLib, 'utf8', (error) => {
        consola.success(`icons-react buildEntry 文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/icons-react-taro/src/buildEntry/lib-new.ts`, entryLib, 'utf8', (error) => {
        consola.success(`icons-react-taro buildEntry 文件写入成功`);
    });

    fsExtra.outputFile(`${process.cwd()}/packages/icons-react/src/buildEntry/lib-new-dts.ts`, entryLibDTS, 'utf8', (error) => {
        consola.success(`icons-react buildEntry dts 文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/icons-react-taro/src/buildEntry/lib-new-dts.ts`, entryLibDTS, 'utf8', (error) => {
        consola.success(`icons-react-taro buildEntry dts 文件写入成功`);
    });
})
