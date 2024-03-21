import {camelCase} from './camelcase'
import glob from 'glob'
import path from 'path'
import fsExtra from 'fs-extra';
import {parse} from 'svg-parser'
import {optimize} from 'svgo'
import consola from "consola";
import svg64 from './svg64';

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

const getTaroSvg = (compoentName: string, svg: string) => {
    const svg64String = svg64(svg)
    const template = `
import {FunctionComponent} from 'react'
import Icon, {defaultProps, SVG_IconProps} from '../IconTemplate'

const IconSVG:FunctionComponent<SVG_IconProps> = (props: SVG_IconProps) => {
    return <Icon {...props} name={props.name || '${compoentName}'} svg64={'${svg64String}'}>
    </Icon>
}

IconSVG.defaultProps = defaultProps
export default IconSVG
`
    return template
}

let entryEs = `/** 此文件由 script generate 脚本生成 */
export { config as IconFontConfig } from "./icons/IconFontConfig.js";
export { default as IconFont } from "./icons/IconFont.js";
export { configure } from "./icons/configure.js";
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

            fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactDir}/src/components/${componentName}.tsx`, getSvg(componentName, viewBox, pathds), 'utf8', (error) => {
                consola.success(`${iconsReactDir} ${componentName} 文件写入成功`);
            });

            fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/src/components/${componentName}.tsx`, getTaroSvg(componentName, svg), 'utf8', (error) => {
                consola.success(`${iconsReactTaroDir} svg ${componentName} 文件写入成功`);
            });

        })

        fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/src/components/${componentName}.tsx`, getIconFont(iconFontName), 'utf8', (error) => {
            consola.success(`${iconsReactTaroDir} ${componentName} 文件写入成功`);
        });
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
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/dist/es/index.es.js`, entryEs + 'import "../style_icon.css";', 'utf8', (error) => {
        consola.success(`${iconsReactTaroDir} ES 入口文件文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactDir}/src/buildEntry/lib-new.ts`, entryLib, 'utf8', (error) => {
        consola.success(`${iconsReactDir} buildEntry 文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/src/buildEntry/lib-new.ts`, entryLib, 'utf8', (error) => {
        consola.success(`${iconsReactTaroDir} buildEntry 文件写入成功`);
    });

    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactDir}/src/buildEntry/lib-new-dts.ts`, entryLibDTS, 'utf8', (error) => {
        consola.success(`${iconsReactDir} buildEntry dts 文件写入成功`);
    });
    fsExtra.outputFile(`${process.cwd()}/packages/${iconsReactTaroDir}/src/buildEntry/lib-new-dts.ts`, entryLibDTS, 'utf8', (error) => {
        consola.success(`${iconsReactTaroDir} buildEntry dts 文件写入成功`);
    });
})
