import { defineConfig } from "vite";
import { preact } from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: "home",
  base: "./",
  plugins: [preact()],
  esbuild: {
    legalComments: "external",
  },
  build: {
    target: "es2022",
    modulePreload: false,
    outDir: "../dist",
    rollupOptions: {
      external: ["preact-render-to-string"],
    },
  },
});
