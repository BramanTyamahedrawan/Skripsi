import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // Wajib untuk mendukung Less di Ant Design
      },
    },
  },
});
