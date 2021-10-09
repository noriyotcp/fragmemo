import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.ELECTRON == "true" ? "./" : ".",
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
    outDir: "build"
  },
});
