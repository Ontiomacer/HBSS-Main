import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5172,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Provide a web-safe alias so imports of 'blackberry-dynamics-sdk' resolve in browser builds.
      "blackberry-dynamics-sdk": path.resolve(__dirname, "./src/mocks/blackberry-dynamics-web-mock.ts"),
    },
  },
}));
