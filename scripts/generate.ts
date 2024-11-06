// vue 版本
import glob from 'glob';
import { parse } from 'svg-parser';
import { camelCase } from './camelCase';
import { optimize } from 'svgo';
import { outputFile, readFile } from 'fs-extra';
import consola from 'consola';
const getSvgTemplate = (viewBox: string, pathd: string[], name: string) => {
  return `<script lang="ts">
import { defineSvgComponent } from '../svg'
export default defineSvgComponent('${name}')
</script>
<template>
  <svg
    :class="classes"
    :style="style"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="${viewBox}"
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
const getSvgBackgroundTemplate = (viewBox: string, pathd: string[], name: string) => {
  return `
<script setup lang="ts">
  import { h, useAttrs, useSlots } from "vue";
  const componentName = "nut-icon";
  const props = defineProps({
    name: { type: String, default: '${name}' },
    size: { type: [String, Number], default: "" },
    width: { type: [String, Number], default: "" },
    height: { type: [String, Number], default: "" },
    classPrefix: { type: String, default: "nut-icon" },
    fontClassName: { type: String, default: "nutui-iconfont" },
    color: { type: String, default: "" },
    tag: { type: String, default: "view" },
  });
  
  const emit = defineEmits<{
    (e: "click", event: Event): void;
  }>();
  
  const onClick = (event: Event) => {
    emit("click", event);
  };
  
  const slots = useSlots();
  const attrs = useAttrs();
  
  const pxCheck = (value: string | number): string | undefined => {
    if (value) {
      return isNaN(Number(value)) ? String(value) : value + "px";
    } else {
      return undefined;
    }
  };
  
  const render = () => {
    return h(
      props.tag,
      {
        class:
          props.fontClassName +
          " " +
          componentName +
          " " +
          props.classPrefix +
          "-" +
          props.name,
        style: {
          color: props.color,
          fontSize: pxCheck(props.size),
          width: pxCheck(props.size),
          height: pxCheck(props.size),
          background: ${`${"`"}url("data:image/svg+xml,%3Csvg viewBox='${viewBox}' xmlns='http://www.w3.org/2000/svg'%3E${pathd.map((path) => {
            return `%3Cpath d='${path}' fill='${'${props.color}'}' fill-opacity='0.9'%3E%3C/path%3E`;
          })}%3C/svg%3E")${"`"}`},
          backgroundRepeat: 'no-repeat',
        },
        onClick,
      },
      slots.default?.()
    );
  };
  </script>
  <template>
    <render />
  </template>
  `
};
const getTaroIconFontTemplate = (name: string) => {
  return `
  <script setup lang="ts">
  import { h, useAttrs, useSlots } from "vue";
  const componentName = "nut-icon";
  const props = defineProps({
    name: { type: String, default: '${name}' },
    size: { type: [String, Number], default: "" },
    width: { type: [String, Number], default: "" },
    height: { type: [String, Number], default: "" },
    classPrefix: { type: String, default: "nut-icon" },
    fontClassName: { type: String, default: "nutui-iconfont" },
    color: { type: String, default: "" },
    tag: { type: String, default: "i" },
  });
  
  const emit = defineEmits<{
    (e: "click", event: Event): void;
  }>();
  
  const onClick = (event: Event) => {
    emit("click", event);
  };
  
  const slots = useSlots();
  const attrs = useAttrs();
  
  const pxCheck = (value: string | number): string | undefined => {
    if (value) {
      return isNaN(Number(value)) ? String(value) : value + "px";
    } else {
      return undefined;
    }
  };
  
  const render = () => {
    return h(
      props.tag,
      {
        class:
          props.fontClassName +
          " " +
          componentName +
          " " +
          props.classPrefix +
          "-" +
          props.name,
        style: {
          color: props.color,
          fontSize: pxCheck(props.size),
          width: pxCheck(props.size),
          height: pxCheck(props.size),
        },
        onClick,
      },
      slots.default?.()
    );
  };
  </script>
  <template>
    <render />
  </template>
  `
};
let f = `${process.cwd()}/packages/icons-svg/*.svg`;

new glob.Glob(f, {}, (err: any, files: string[]) => {

  let entryEs = `/** 此文件由 script generate 脚本生成 */
export { config as IconFontConfig } from "./icons/IconFontConfig.js";
// export { SvgConfig } from "./icons/SvgConfig.js";
export { default as IconFont } from "./icons/IconFont.js";
\n`;
  let entryLib = `/** 此文件由 script generate 脚本生成 */
import IconFont from './iconFont';
import config from '@iconfont/config.json';
export { IconFont, config };
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


      outputFile(`${process.cwd()}/packages/icons-vue/src/components/${filename}.vue`, getSvgTemplate(viewBox, pathds, name), 'utf8', (error) => {
        consola.success(`${filename} 文件写入成功`);
      });

      outputFile(`${process.cwd()}/packages/icons-vue-taro/src/components/${filename}.vue`, getSvgBackgroundTemplate(viewBox, pathds, name), 'utf8', (error) => {
        consola.success(`${filename} 文件写入成功`);
      });
    })
  })

  outputFile(`${process.cwd()}/packages/icons-vue/dist/es/index.es.js`, entryEs + 'import "../style_icon.css";', 'utf8', (error) => {
    consola.success(`icons-vue ES 入口文件文件写入成功`);
  });
  outputFile(`${process.cwd()}/packages/icons-vue/src/buildEntry/lib-new.ts`, entryLib, 'utf8', (error) => {
    consola.success(`icons-vue Lib 入口文件文件写入成功`);
  });

  outputFile(`${process.cwd()}/packages/icons-vue-taro/dist/es/index.es.js`, entryEs + 'import "../style_icon.css";', 'utf8', (error) => {
    consola.success(`icons-vue-taro ES 入口文件文件写入成功`);
  });

  let entryTSC = `import { DefineComponent } from 'vue';
export declare class IconFontConfig { static [key: string]:any }
export declare const IconFont
`;
  let s = entryArray.map(item => {
    return `export declare class ${item} {}`;
  });
  entryTSC += s.join('\n');
  outputFile(`${process.cwd()}/packages/icons-vue-taro/dist/types/index.d.ts`, entryTSC, 'utf8', (error) => {
    consola.success(`TS类型文件文件写入成功`);
  });
  outputFile(`${process.cwd()}/packages/icons-vue/src/components/iconsConfig.ts`, `export const iconsConfig = ${JSON.stringify(entryArray)}`, 'utf8', (error) => {
    consola.success(`icons-vue 文件列表配置写入成功`);
  });
  outputFile(`${process.cwd()}/packages/icons-vue-taro/src/components/iconsConfig.ts`, `export const iconsConfig = ${JSON.stringify(entryArray)}`, 'utf8', (error) => {
    consola.success(`icons-vue-tar 文件列表配置写入成功`);
  });
});
