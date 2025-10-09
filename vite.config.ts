import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "client", "src"),
      "@shared": resolve(__dirname, "shared"),
      "@assets": resolve(__dirname, "attached_assets"),
      "@/components": resolve(__dirname, "client", "src", "components"),
      "@/pages": resolve(__dirname, "client", "src", "pages"),
      "@/hooks": resolve(__dirname, "client", "src", "hooks"),
      "@/lib": resolve(__dirname, "client", "src", "lib"),
      "@/types": resolve(__dirname, "client", "src", "types"),
      "@/ui": resolve(__dirname, "client", "src", "components", "ui"),
      "@/components/ui": resolve(__dirname, "client", "src", "components", "ui"),
    },
  },
  root: resolve(__dirname, "client"),
  base: "./", // Add this to fix asset paths
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});