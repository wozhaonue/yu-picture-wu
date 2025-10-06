import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 条件性启用 Vue DevTools，只在明确需要时启用
    // vueDevTools(),
  ],
  css: {
    // 预处理器选项
    preprocessorOptions: {
      // 针对 'scss' (或 'sass') 设置
      scss: {
        // *** 关键修改在这里 ***
        // 强制 Sass 使用现代 JS API
        api: 'modern-compiler',
      },
      // 如果你使用的是 .sass 语法（缩进语法），则需要配置 'sass'
      // sass: {
      //   api: 'modern-compiler',
      // },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@images': path.resolve(__dirname, 'src/assets/images'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@layout': path.resolve(__dirname, 'src/layout'),
      '@styles': path.resolve(__dirname,'src/styles'),
      '@constants': path.resolve(__dirname,'src/constants'),
    },
  },
})
