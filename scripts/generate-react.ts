import {camelCase} from './camelcase'
import glob from 'glob'
import path from 'path'
import fsExtra from 'fs-extra';
import {parse} from 'svg-parser'
import {optimize} from 'svgo'
import consola from "consola";

const getSvg = (compoentName: string, viewBox: string, d: any[]) => {
    const template = `
import {FunctionComponent} from 'react'
import Icon, {defaultProps, SVG_IconProps} from '../IconTemplate'

const Add:FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    return <Icon {...props} name={props.name || '${compoentName}'} viewBox={'${viewBox}'}>
        ${d.map(d => {
        return `<path
        d="${d}"
        fill="currentColor"
        fillOpacity="0.9"
        ></path>`
    })}
    </Icon>
}

Add.defaultProps = defaultProps
export default Add
`
    return template
}
const getIconFont = (compoentName: string) => {
    const template = `
import IconFont, {IconFontProps} from "../IconFont";
import {FunctionComponent} from "react";

const Icon: FunctionComponent<IconFontProps> = (props: IconFontProps) => {
    return <IconFont {...props} name={props.name || '${compoentName}'}/>
}
Icon.displayName = 'NutIcon${compoentName}'
export default Icon
`
    return template
}

const getTaroSvg = (compoentName: string, viewBox: string, d: any[]) => {
    const template = `import classnames from 'classnames'
export interface IconProps {
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
        if(value === '') return ''
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
    const props2Style:any = {}
    const checkedWidth = pxCheck(width || '')
    const checkedHeight = pxCheck(height || '')
    if(checkedWidth) {
        props2Style['width'] = checkedWidth
    }
    if(checkedHeight) {
        props2Style['height'] = checkedHeight
    }
    const getStyle = () => {
        return {
            ...style,
            backgroundImage: \`url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="\${color || 'currentColor'}" viewBox="${viewBox}">${d.map(d => {return `<path d="${d}" fillOpacity="0.9"></path>`})}</svg>')\`,
            backgroundRepeat: 'no-repeat',
            ...props2Style
        }
    }
    return <>
        <span
            className={classes()}
            style={getStyle()}
            onClick={handleClick}
            color={color}
        ></span>
    </>
}
${compoentName}.defaultProps = defaultProps
export default ${compoentName}
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
                consola.success(`\icons-react ${componentName} 文件写入成功`);
            });

            // fsExtra.outputFile(`${process.cwd()}/packages/icons-react-taro/src/components/${componentName}.tsx`, getTaroSvg(componentName, viewBox, pathds), 'utf8', (error) => {
            //     consola.success(`${componentName} 文件写入成功`);
            // });

        })

        fsExtra.outputFile(`${process.cwd()}/packages/icons-react-taro/src/components/${componentName}.tsx`, getIconFont(iconFontName), 'utf8', (error) => {
            consola.success(`icons-react-taro ${componentName} 文件写入成功`);
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
    fsExtra.outputFile(`${process.cwd()}/packages/icons-react-taro/dist/es/index.es.js`, entryEs + 'import "../style_iconfont.css";', 'utf8', (error) => {
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
