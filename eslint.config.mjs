import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      ".wrangler/**",
      "scripts/**",
      "worker-configuration.d.ts",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,

  // Browser/Node globals available in Astro runtime + build config.
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,tsx,astro}"],
    languageOptions: {
      globals: {
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
        console: "readonly",
        process: "readonly",
        document: "readonly",
        window: "readonly",
        FormData: "readonly",
        HTMLFormElement: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        Event: "readonly",
        Response: "readonly",
        Request: "readonly",
        TextEncoder: "readonly",
      },
    },
  },

  // Base typescript-eslint rules (no type-checking) — applies to TS + .astro
  ...tseslint.configs.recommended,

  // Type-checked rules: src TS files only. astro-eslint-parser can't drive type info.
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ["src/**/*.{ts,mts,cts,tsx}"],
  })),
  {
    files: ["src/**/*.{ts,mts,cts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  ...astro.configs.recommended,
  ...astro.configs["jsx-a11y-recommended"],

  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".astro"],
      },
    },
  },

  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
