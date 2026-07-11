import { defineConfig } from '@lark-apaas/coding-preset-vite-react'

export default defineConfig({
  // 强制替换模板变量，线上不会再出现{{appName}}
  define: {
    __APP_NAME: JSON.stringify("Terminal BETA6"),
    'import.meta.env.appName': JSON.stringify("Terminal BETA6")
  }
})
