import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".claude/**",
  ]),
  {
    rules: {
      // React 19's `react-hooks/set-state-in-effect` flags the standard
      // "load browser-only state (localStorage / feature detection) on
      // mount" pattern and post-mount API fetches. Both are correct in
      // this SSR-safe client-first PWA — the alternative (lazy useState
      // init) would cause hydration mismatches. Server Components +
      // React `use()` + Suspense would obsolete the pattern, but that's
      // a separate migration.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
