import { resolve } from 'path';
import { defineConfig } from 'vite';

let input = {
  style_icon: `./src/style_icon.scss`,
  style_icon_img: `./src/style_icon_img.scss`,
  style_icon_loading: `./src/style_icon_loading.scss`,
  style_icon_animate: `./src/style_icon_animate.scss`,
  style_iconfont: `./src/style_iconfont.scss`,
};


export default defineConfig({
  publicDir: false,
  build: {
    minify: true,
    cssCodeSplit: true,
    assetsInlineLimit: 1024 * 200,
    rollupOptions: {
      input,
      output: {
        entryFileNames: '[name].js',
        assetFileNames: `[name].[ext]`,
        dir: resolve(__dirname, './dist/'),
      }
    },
    emptyOutDir: false
  }
});
