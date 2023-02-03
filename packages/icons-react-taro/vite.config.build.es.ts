import { defineConfig } from 'vite'
import {resolve} from 'path'
import react from '@vitejs/plugin-react'
import {iconsConfig} from './src/components/iconsConfig'

let input = {
  IconFont: `./src/IconFont.tsx`,
  IconFontConfig: `./src/buildEntry/iconFontConfig.ts`,
  SvgConfig: `./src/buildEntry/svgConfig.ts`,
} as any;

iconsConfig.map((name) => {
  input[name] = `./src/components/${name}.tsx`;
});

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [react()],
  build: {
    lib: {
      entry: input,
      formats: ['es']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react', 'react-dom', 'classnames'],
      // input,
      output: {
        entryFileNames: '[name].js',
        dir: resolve(__dirname, './dist/es/icons'),
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
