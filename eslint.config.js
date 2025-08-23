export default [
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        getComputedStyle: "readonly",
        Math: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { "args": "none" }],
      "no-console": "off",
      "semi": ["warn", "always"],
      "quotes": ["warn", "single"]
    }
  }
];