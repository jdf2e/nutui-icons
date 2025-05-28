import { resolve } from 'path';
import { defineConfig } from 'vite';

let input = {
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
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['@tarojs/components'],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: `[name].[ext]`,
        dir: resolve(__dirname, './dist/'),
      }
    },
    emptyOutDir: false
  }
});
