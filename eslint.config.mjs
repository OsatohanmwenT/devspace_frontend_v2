import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const featureInternals = {
  group: ["~/features/*/*"],
  message: "Import a feature through its index.ts only.",
};
const mockBackend = {
  group: ["~/mocks", "~/mocks/*"],
  message: "Only features/*/api may use the mock backend.",
};
const features = {
  group: ["~/features", "~/features/*"],
  message: "Shared code must not depend on features.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [featureInternals, mockBackend] }],
    },
  },
  {
    // The api layer is the one place allowed to reach the mock backend.
    files: ["src/features/*/api/**", "src/mocks/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [featureInternals] }],
    },
  },
  {
    files: [
      "src/components/**",
      "src/hooks/**",
      "src/lib/**",
      "src/config/**",
      "src/providers/**",
      "src/types/**",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: [features, mockBackend] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
