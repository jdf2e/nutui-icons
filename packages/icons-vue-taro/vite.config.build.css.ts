import { resolve } from 'path';
import { defineConfig } from 'vite';
import config from './package.json';

const banner = `/*!
* ${config.name} v${config.version} ${new Date()}
* (c) 2022 @jdf2e.
* Released under the MIT License.
*/`;
let input = {
  style_iconfont: `./src/style_iconfont.scss`,
};


export default defineConfig({
  build: {
    minify: true,
    cssCodeSplit: true,
    assetsInlineLimit: 1024 * 200,
    rollupOptions: {
      input,
      output: {
        banner,
        entryFileNames: '[name].js',
        assetFileNames: `[name].[ext]`,
        dir: resolve(__dirname, './dist/'),
      }
    },
    emptyOutDir: false
  }
});
