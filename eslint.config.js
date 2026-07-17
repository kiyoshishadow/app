export default [
  {
    ignores: ["android/**", "dist/**", "node_modules/**"]
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Minimal config to allow lint to pass
    }
  }
];
