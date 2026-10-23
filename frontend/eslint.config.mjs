import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Barrierefreiheit = auch SEO: Alt-Texte (inkl. next/image), Links und Überschriften mit Inhalt,
    // gültiges ARIA, Sprache am <html>. Als Fehler – `npm run lint` bricht ab. Das Plugin selbst
    // registriert eslint-config-next. Dekorative Bilder: alt="" (bewusst leer) ist erlaubt.
    name: "fa/a11y",
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "jsx-a11y/alt-text": ["error", { elements: ["img", "object", "area", 'input[type="image"]'], img: ["Image"] }],
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/iframe-has-title": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/scope": "error",
      "jsx-a11y/tabindex-no-positive": "error",
      "jsx-a11y/no-distracting-elements": "error",
      "jsx-a11y/autocomplete-valid": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Aus node_modules kopierte MapLibre-Dateien (scripts/copy-maplibre-worker.mjs)
    "public/maplibre/**",
  ]),
]);

export default eslintConfig;
