import { defineConfig } from "tsdown";

/** Produktions-Build: ein ESM-Bundle pro Einstiegspunkt, @fa/shared wird mitgebündelt. */
export default defineConfig({
  entry: {
    server: "src/server.ts",
    "sync-indexes": "scripts/sync-indexes.ts",
    "check-storage": "scripts/check-storage.ts",
  },
  platform: "node",
  target: "node24",
  format: "esm",
  outDir: "dist",
  fixedExtension: false,
  clean: true,
  sourcemap: true,
  dts: false,
  deps: { alwaysBundle: [/^@fa\//] },
});
