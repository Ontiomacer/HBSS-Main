// vite.config.ts
import { defineConfig } from "file:///C:/Users/Anil/Desktop/enigma-forge-ui-main/enigma-forge-ui-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Anil/Desktop/enigma-forge-ui-main/enigma-forge-ui-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Anil/Desktop/enigma-forge-ui-main/enigma-forge-ui-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Anil\\Desktop\\enigma-forge-ui-main\\enigma-forge-ui-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5172
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      // Provide a web-safe alias so imports of 'blackberry-dynamics-sdk' resolve in browser builds.
      "blackberry-dynamics-sdk": path.resolve(__vite_injected_original_dirname, "./src/mocks/blackberry-dynamics-web-mock.ts")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBbmlsXFxcXERlc2t0b3BcXFxcZW5pZ21hLWZvcmdlLXVpLW1haW5cXFxcZW5pZ21hLWZvcmdlLXVpLW1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFuaWxcXFxcRGVza3RvcFxcXFxlbmlnbWEtZm9yZ2UtdWktbWFpblxcXFxlbmlnbWEtZm9yZ2UtdWktbWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQW5pbC9EZXNrdG9wL2VuaWdtYS1mb3JnZS11aS1tYWluL2VuaWdtYS1mb3JnZS11aS1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogNTE3MixcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIC8vIFByb3ZpZGUgYSB3ZWItc2FmZSBhbGlhcyBzbyBpbXBvcnRzIG9mICdibGFja2JlcnJ5LWR5bmFtaWNzLXNkaycgcmVzb2x2ZSBpbiBicm93c2VyIGJ1aWxkcy5cbiAgICAgIFwiYmxhY2tiZXJyeS1keW5hbWljcy1zZGtcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9tb2Nrcy9ibGFja2JlcnJ5LWR5bmFtaWNzLXdlYi1tb2NrLnRzXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJYLFNBQVMsb0JBQW9CO0FBQ3haLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxFQUNsQixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQTtBQUFBLE1BRXBDLDJCQUEyQixLQUFLLFFBQVEsa0NBQVcsNkNBQTZDO0FBQUEsSUFDbEc7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
