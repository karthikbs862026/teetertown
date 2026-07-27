import { defineConfig } from "vite";
import packageMetadata from "./package.json" with { type: "json" };

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@dimforge/rapier3d-compat": "@dimforge/rapier3d"
    }
  },
  define: {
    __TEETERTOWN_BUILD_VERSION__: JSON.stringify(packageMetadata.version),
    __TEETERTOWN_COMMIT_SHA__: JSON.stringify(process.env.GITHUB_SHA ?? "local"),
    __TEETERTOWN_LAB_ENABLED__: JSON.stringify(mode !== "production"),
    __TEETERTOWN_RAPIER_RUNTIME_VARIANT__: JSON.stringify("modular-wasm-browser")
  },
  build: {
    target: "es2022",
    sourcemap: true,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 650
  },
  server: {
    port: 4173,
    strictPort: true
  },
  preview: {
    port: 4173,
    strictPort: true
  }
}));
