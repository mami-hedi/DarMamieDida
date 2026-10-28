import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libs
          "vendor-react":  ["react", "react-dom", "react-router-dom"],
          "vendor-ui":     ["@radix-ui/react-dialog", "@radix-ui/react-tooltip", "@radix-ui/react-select"],
          "vendor-query":  ["@tanstack/react-query"],
          "vendor-socket": ["socket.io-client"],
          "vendor-i18n":   ["react-i18next", "i18next"],
          "vendor-icons":  ["react-icons"],
          "vendor-lightbox": ["yet-another-react-lightbox"],
          // App chunks
          "chunk-admin":   [
            "./src/pages/AdminDashboard",
            "./src/pages/AdminReservations",
            "./src/pages/AdminRooms",
            "./src/pages/AdminClients",
            "./src/pages/AdminAvailability",
            "./src/pages/AdminCalendar",
            "./src/pages/AdminLogin",
          ],
        },
      },
    },
  },
});
