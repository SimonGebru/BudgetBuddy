import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
  ignores: ["dist/**", "dev-dist/**", "coverage/**"],
},
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["tailwind.config.js", "tailwind.config.cjs", "vite.config.js"],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      "no-unused-vars": "warn",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["tailwind.config.js", "tailwind.config.cjs", "vite.config.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      sourceType: "module",
    },
    rules: {
      "no-undef": "off",
    },
  },
]);
