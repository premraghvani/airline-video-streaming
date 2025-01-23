const globals = require("globals");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    ignores: ["**/node_modules/*", "**/static/*"],
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "curly": "error",
      "use-isnan":"error",
      "valid-typeof":"error"
    },
  },
];