import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // host: '0.0.0.0', // 关键配置：允许所有IP访问
    port: 5173,       // 指定端口
    strictPort: true, // (可选)端口占用时直接退出
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
