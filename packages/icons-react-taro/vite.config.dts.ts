import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import fsExtra from 'fs-extra'
import react from '@vitejs/plugin-react'

export default defineConfig({
  publicDir: false,
  plugins: [react(), dts({
    rollupTypes: false,
    copyDtsFiles: true,
    outputDir: 'dist/types',
    afterBuild: () => {
      fsExtra.removeSync('./dist/types/icons-react-taro.js')
      fsExtra.appendFile('./dist/types/index.d.ts', 'export declare class IconFontConfig { [key: string]:any }')
    }
  })],
  build: {
    outDir: 'dist/types',
    lib: {
      entry: './src/buildEntry/lib-new-dts.ts',
      formats: ['es'],
    },
  }
})
