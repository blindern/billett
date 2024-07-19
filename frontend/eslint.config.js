import js from "@eslint/js"
import angular from "angular-eslint"
import prettier from "eslint-plugin-prettier/recommended"
import tseslint from "typescript-eslint"

export default tseslint.config(
  prettier,
  {
    ignores: ["dist/", ".angular/"],
  },
  {
    files: ["**/*.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "billett",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "billett",
          style: "kebab-case",
        },
      ],
      // TODO: Fix this.
      "@angular-eslint/component-class-suffix": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/label-has-associated-control": "off",
      "@angular-eslint/template/no-autofocus": "off",
      "@angular-eslint/template/click-events-have-key-events": "off",
    },
  },
)
