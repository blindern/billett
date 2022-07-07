import { defineConfig } from "vite"

export default defineConfig({
  define: {
    DEBUG: !!process.env.DEBUG ?? false,
    BACKEND_URL: JSON.stringify(process.env.BACKEND_URL ?? "/"),
  },
})
