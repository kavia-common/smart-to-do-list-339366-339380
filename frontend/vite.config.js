import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PUBLIC_INTERFACE
export default defineConfig({
  /** Vite config for the Todo List SPA. */
  plugins: [react()],
  server: {
    host: true,
    // Port is controlled via CLI script using REACT_APP_PORT to match container env.
  },
  preview: {
    host: true
  }
});
