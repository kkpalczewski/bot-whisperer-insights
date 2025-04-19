import react from "@vitejs/plugin-react";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";
import deadfile from "vite-plugin-deadfile";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    deadfile({
      root: "src",
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/public/**",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/__tests__/**",
        "**/vite-env.d.ts",
      ],
    }),
  ].filter(Boolean),
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
      process.env.SUPABASE_URL || "https://ssqhxvxdxghrxthxdojc.supabase.co"
    ),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
      process.env.SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcWh4dnhkeGdocnh0aHhkb2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5ODg0OTksImV4cCI6MjA2MDU2NDQ5OX0.CPwNQXenUwDqC9qpAAeGiE6WzdQxneX6dTVNDLAPszg"
    ),
  },
}));
