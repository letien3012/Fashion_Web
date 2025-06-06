import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy /api requests to backend
      "/api": {
        target: "http://localhost:3005",
        changeOrigin: true,
      },
      // Proxy /uploads requests to backend
      "/uploads": {
        target: "http://localhost:3005",
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
});
