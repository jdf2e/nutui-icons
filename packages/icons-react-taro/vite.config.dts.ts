import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import fsExtra, {appendFile} from 'fs-extra'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [react(), dts({
    rollupTypes: true,
    copyDtsFiles: false,
    afterBuild: () => {
      fsExtra.removeSync('./dist/types/icons-react.js')
      fsExtra.appendFile('./dist/types/index.d.ts', 'export declare class IconFontConfig { [key: string]:any }')
    }
  })],
  build: {
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['@tarojs/components'],
    },
    outDir: 'dist/types',
    lib: {
      entry: './src/buildEntry/lib-new-dts.ts',
      formats: ['es'],
    },
  }
})
