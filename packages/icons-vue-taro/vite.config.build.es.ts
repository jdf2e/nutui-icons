import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import config from './package.json';
import { iconsConfig } from './src/components/iconsConfig';
const banner = `/*!
* ${config.name} v${config.version} ${new Date()}
* (c) 2022 @jdf2e.
* Released under the MIT License.
*/`;

let input = {
  IconFont: `./src/IconFont.vue`,
  IconFontConfig: `./src/buildEntry/iconFontConfig.ts`,
};

iconsConfig.map((name) => {
  input[name] = `./src/components/${name}.vue`;
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: '',
      name: 'index',
      // the proper extensions will be added
      formats: ['es']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      input,
      output: {
        banner,
        entryFileNames: '[name].js',
        dir: resolve(__dirname, './dist/es/icons/'),
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
