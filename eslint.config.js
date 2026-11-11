import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/", ".astro/", "node_modules/", ".firebase/", "public/"] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  astro.configs["flat/recommended"],
  astro.configs["flat/jsx-a11y-strict"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: { projectService: false, project: "./tsconfig.json" },
    },
  },
  {
    files: ["**/*.tsx"],
    ...jsxA11y.configs.strict,
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
