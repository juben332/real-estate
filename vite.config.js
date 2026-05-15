import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /api calls to the Vercel dev server (port 3000)
      "/api": "http://localhost:3000",
    },
  },
});
