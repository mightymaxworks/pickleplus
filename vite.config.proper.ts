import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { themeFromJson } from "@replit/vite-plugin-shadcn-theme-json";
import theme from "./theme.json";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    themeFromJson(theme),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  build: {
    outDir: "dist/public", // Build directly to dist/public where server expects files
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});