import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/node_modules/*", "**/dist/*", "**/build/*", "**/.plasmo/*"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
  {
    rules:{
      "@typescript-eslint/no-explicit-any": "off",
    }
  }
);
