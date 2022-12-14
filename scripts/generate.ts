
import glob from 'glob';
import { parse } from 'svg-parser';
import { camelCase } from './camelCase';
import { optimize } from 'svgo';
import { outputFile, readFile } from 'fs-extra';
import consola from 'consola';
const getTemplate = (viewBox: string, pathd: string[]) => {
    return `
<script setup lang="ts">
const props = defineProps({
class: { type: String, default: "nut-icon" },
name: { type: String, default: "" },
color: { type: String, default: "" },
width: { type: [String, Number], default: "16px" },
height: { type: [String, Number], default: "16px" },
});

const emit = defineEmits<{
(e: "click", event: Event): void;
}>();

const onClick = (event: Event) => {
emit("click", event);
};
</script>
<template>
<svg
    :class="class"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :color="color"
    viewBox="${viewBox}"
    :aria-labelledby="name"
    role="presentation"
>
    ${pathd.map(d => {
        return `<path
        d="${d}"
        fill="currentColor"
        fill-opacity="0.9"
        ></path>`
    })}
</svg>
</template>`
};
let f = `${process.cwd()}/packages/icons-svg/*.svg`;

new glob.Glob(f, {}, (err: any, files: string[]) => {

    let entryEs = `/** 此文件由 script generate 脚本生成 */
export { config as IconFontConfig } from "./icons/IconFontConfig.js";
// export { SvgConfig } from "./icons/SvgConfig.js";
export { default as IconFont } from "./icons/IconFont.js";
\n`;
    let entryLib = `/** 此文件由 script generate 脚本生成 */
    import { App } from 'vue';
    import IconFont from '../IconFont.vue';
    import config from '../../../../iconfont/config.json';
    function install(app: App) {
      app.component('IconFont', IconFont);
    }
    export { IconFont, config };
    export default { install, config };
\n`;
    let entryArray: string[] = [];

    files.forEach((filepath: string) => {
        let sp = filepath.split('/');
        let name = sp[sp.length - 1].replace('.svg', '');
        let filename = camelCase(name, { pascalCase: true });

        entryEs += `export { default as ${filename} } from "./icons/${filename}.js";\n`;
        entryLib += `export { default as ${filename} } from "../components/${filename}.vue";\n`;
        entryArray.push(filename);

        readFile(filepath, { encoding: 'utf-8' }).then(res => {


            let g = optimize(res).data;
            const ast: any = parse(g).children[0];
            let pathds: string[] = ast.children.map((item: any) => {
                return item.properties.d;
            })
            let viewBox = ast.properties.viewBox;


            outputFile(`${process.cwd()}/packages/icons-vue/src/components/${filename}.vue`, getTemplate(viewBox, pathds), 'utf8', (error) => {
                consola.success(`${filename} 文件写入成功`);
            });
        })
    })

    outputFile(`${process.cwd()}/packages/icons-vue/dist/es/index.es.js`, entryEs, 'utf8', (error) => {
        consola.success(`ES 入口文件文件写入成功`);
    });
    outputFile(`${process.cwd()}/packages/icons-vue/src/buildEntry/lib-new.ts`, entryLib, 'utf8', (error) => {
        consola.success(`Lib 入口文件文件写入成功`);
    });
    let entryTSC = `import { DefineComponent } from 'vue';
export declare class IconFontConfig { static [key: string]:any }
export declare class IconFont {}
`;
    let s = entryArray.map(item => {
        return `export declare class ${item} {}`;
    });
    entryTSC += s.join('\n');
    consola.success(entryTSC);
    outputFile(`${process.cwd()}/packages/icons-vue/dist/types/index.d.ts`, entryTSC, 'utf8', (error) => {
        consola.success(`TS类型文件文件写入成功`);
    });
    outputFile(`${process.cwd()}/packages/icons-vue/src/components/iconsConfig.ts`, `export const iconsConfig = ${JSON.stringify(entryArray)}`, 'utf8', (error) => {
        consola.success(`文件列表配置写入成功`);
    });
});
