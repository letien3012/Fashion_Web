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
  // server: {
  //   proxy: {
  //     // Proxy /api requests to backend
  //     "/api": {
  //       target: "http://0.0.0.0:3005",
  //       changeOrigin: true,
  //     },
  //     // Proxy /uploads requests to backend
  //     "/uploads": {
  //       target: "http://0.0.0.0:3005",
  //       changeOrigin: true,
  //       rewrite: (path) => path,
  //     },
  //   },
  // },

  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:3005", // Dùng biến môi trường
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:3005", // Dùng biến môi trường
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
});
