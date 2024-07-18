import { defineConfig } from "vite"
import babel from "vite-plugin-babel"

export default defineConfig({
  plugins: [
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugins: ["angularjs-annotate"],
      },
    }),
  ],
  define: {
    DEBUG: !!process.env.DEBUG ?? false,
    BACKEND_URL: JSON.stringify(process.env.BACKEND_URL ?? "/"),
  },
})
