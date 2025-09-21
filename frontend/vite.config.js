import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Allow access from browser via container
    watch: {
      usePolling: true, //  Detect file changes inside container
    },
  },
});
