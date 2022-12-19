import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import config from './package.json';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // example : additionalData: `@import "./src/design/styles/variables";`
        // dont need include file extend .scss
        additionalData: `@import "../../iconfont/iconfont_component.scss";`
      }
    }
  }
})
