import { defineConfig } from 'vite'
import {resolve} from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [react()],
  resolve: {
    alias: [
      // 把 react/jsx-runtime 指向垫片并打包进库，UMD 产物因此只依赖 react
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
      external: ['react', 'react-dom'],
      output: {
        dir: resolve(__dirname, './dist/lib/'),
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        }
      }
    }
  }
})
