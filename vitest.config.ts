import { defineConfig } from "vitest/config";

// Config aparte de vite.config.ts: así los tests no cargan el prerender
export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
});
