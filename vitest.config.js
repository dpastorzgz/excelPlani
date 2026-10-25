import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.js", "tests/integration/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: ["dashboard-config.js", "dashboard-assets/**/*.js"],
      exclude: ["dashboard-assets/vendor/**", "dashboard-assets/app.js"],
      thresholds: {
        lines: 85,
        functions: 85,
        statements: 85,
        branches: 85,
      },
    },
  },
});
