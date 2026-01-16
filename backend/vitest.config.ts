import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Exclude tests that depend on supertest (CommonJS module resolution issue with Vitest)
    // when running the default test suite. The test:integration script will run them explicitly.
    exclude: ["src/__tests__/apikeys.test.ts", "**/node_modules/**", "**/dist/**"]
  }
});
