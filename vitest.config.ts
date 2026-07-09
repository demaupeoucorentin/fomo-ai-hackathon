import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["core/**/*.spec.ts", "adapters/**/*.spec.ts"],
    environment: "node",
  },
});
