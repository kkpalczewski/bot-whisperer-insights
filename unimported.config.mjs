export default {
  entry: ["src/main.tsx"],
  extensions: [".js", ".jsx", ".ts", ".tsx"],
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
  ignoreUnresolved: [
    "react",
    "react-dom",
    "@radix-ui/*",
    "@testing-library/*",
    "vitest",
    "jsdom",
  ],
};
