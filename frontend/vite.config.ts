import babel from "vite-plugin-babel"
import { defineConfig } from "vite"

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
