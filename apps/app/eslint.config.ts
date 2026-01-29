// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([
  {
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
    ignores: [
      "dist/**",
      ".output/**",
      "node_modules/**",
      "src-tauri/target/**",
      "**/target/**",
    ],
  },
  {
    files: ["src-tauri/**"],
    rules: {},
  },
]);
