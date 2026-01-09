import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    // Exclude nested backend tests so frontend's test runner doesn't try to
    // resolve backend-only deps like `supertest` that are installed in
    // `frontend/backend` instead of `frontend/node_modules`.
    exclude: ["**/backend/**", "**/node_modules/**", "**/dist/**"]
  }
});
