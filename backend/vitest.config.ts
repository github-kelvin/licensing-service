import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Exclude tests that depend on supertest (CommonJS module resolution issue with Vitest)
    exclude: ["src/__tests__/apikeys.test.ts", "src/__tests__/integration/**", "**/node_modules/**", "**/dist/**"]
  }
});
