import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost")
  .hostname;
let hmrConfig;

if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env.FRONTEND_PORT) || 8002,
    clientPort: 443,
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [host],
    cors: {
      preflightContinue: true,
    },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
      // See https://vitejs.dev/config/server-options.html#server-fs-allow for more information
      allow: [".", "../shared", "../dist", "../node_modules"],
    },
  },
  root: "home",
  base: "./",
  envPrefix: "SHOPIFY_",
  plugins: [preact()],
  esbuild: {
    legalComments: "external",
  },
  build: {
    target: "es2022",
    modulePreload: false,
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      external: ["preact-render-to-string"],
    },
  },
});
