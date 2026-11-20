import { resolve } from 'path';
import { defineConfig } from 'vite';

let input = {
  style_base: `./src/style_base.scss`,
  style_loading: `./src/style_loading.scss`,
  style_animation: `./src/style_animation.scss`,
  style_icon: `./src/style_icon.scss`,
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
