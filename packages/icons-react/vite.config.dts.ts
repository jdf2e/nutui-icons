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
    outDir: 'dist/types',
    lib: {
      entry: './src/buildEntry/lib-new-dts.ts',
      formats: ['es'],
    },
  }
})
