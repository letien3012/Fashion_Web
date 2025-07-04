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
        target: "http://10.18.226.131:3005", // IP của máy đang chạy Node.js
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://10.18.226.131:3005",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
});
