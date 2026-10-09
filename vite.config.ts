import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 的配置文件
// 作用：告诉 Vite 用 @vitejs/plugin-vue 插件来编译 .vue 单文件组件
// 这个文件与 vue-start / pomodoro 项目里的一模一样，暂时不用改动它
export default defineConfig({
  plugins: [vue()],
})
