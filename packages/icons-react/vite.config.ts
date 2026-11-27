import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^\.\.\/\.\.\/(style_icon(?:_img|_loading|_animate)?)\.css$/,
        replacement: resolve(__dirname, 'src/$1.scss'),
      },
    ],
  },
})
