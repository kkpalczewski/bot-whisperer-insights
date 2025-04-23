import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.yaml"],
  optimizeDeps: {
    exclude: ["glob"], // Exclude glob from optimization to prevent browser compatibility issues
  },
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    // Define environment variables that will be replaced at build time
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.SUPABASE_URL || "https://PLACEHOLDER.supabase.co"

    ),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
      process.env.SUPABASE_ANON_KEY || "ANON_KEY_PLACEHOLDER"
    ),
  },
}));
