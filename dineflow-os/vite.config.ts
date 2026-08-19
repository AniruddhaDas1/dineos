/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// React Fast Refresh preamble injector.
// @vitejs/plugin-react@6.0.x fails to inject the refresh preamble into
// index.html in some setups (window.$RefreshSig$ ends up undefined and the
// app crashes on first render). This guarantees the preamble is present in dev.
function reactRefreshPreamble() {
  return {
    name: "react-refresh-preamble-fix",
    apply: "serve" as const,
    transformIndexHtml() {
      const code = `import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;`;
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: code,
        },
      ];
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    reactRefreshPreamble(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.svg", "icon-512.svg"],
      manifest: {
        name: "DineFlow",
        short_name: "DineFlow",
        description: "DineFlow — order at your table",
        theme_color: "#0E0E10",
        background_color: "#0E0E10",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname === "images.unsplash.com",
            handler: "CacheFirst",
            options: {
              cacheName: "food-images",
              expiration: { maxEntries: 60 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
