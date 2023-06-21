import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import fsExtra from 'fs-extra'
import path, { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@iconfont': path.join(__dirname, '../../iconfont')
    }
  },
  plugins: [vue(), dts({
    rollupTypes: true,
    copyDtsFiles: false,
    afterBuild: () => {
      fsExtra.removeSync(resolve(__dirname, './dist/types/icons-vue.mjs'))
      fsExtra.appendFile(resolve(__dirname, './dist/types/index.d.ts'), 'export declare class IconFontConfig { [key: string]:any }')
    }
  })],
  build: {
    outDir: resolve(__dirname, './dist/types'),
    lib: {
      entry: resolve(__dirname, 'src/buildEntry/lib-new-dts.ts'),
      formats: ['es']
    },
  }
})

