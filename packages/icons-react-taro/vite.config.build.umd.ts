import { defineConfig } from 'vite'
import {join, resolve} from 'path'
import react from '@vitejs/plugin-react'
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  define: {
    'process.env.TARO_ENV': 'process.env.TARO_ENV',
  },
  plugins: [react(), {
    name: 'revert Process.env',
    apply: 'build',
    async closeBundle() {
      const umdFile = join(__dirname, 'dist/lib/index.umd.js')
      if (fs.existsSync(umdFile)) {
        const umdFileContent = fs.readFileSync(umdFile).toString().replace(/\(void 0\)\.TARO_ENV/g, 'process.env.TARO_ENV')
        fs.writeFileSync(umdFile, umdFileContent)
      }
      console.log('File rewritten successfully!');
    }
  }],
  resolve: {
    alias: [
      // 把 react/jsx-runtime 指向垫片并打包进库，避免 React 19 下加载报错
      { find: /^react\/jsx(-dev)?-runtime$/, replacement: resolve(__dirname, './jsx-runtime.shim.ts') },
    ],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/buildEntry/lib-new.ts'),
      name: 'NutUIIcons',
      fileName: 'index',
      formats: ['umd']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react', 'react-dom', '@tarojs/components'],
      output: {
        dir: resolve(__dirname, './dist/lib/'),
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tarojs/components': 'TaroComponents'
        }
      }
    }
  }
})
