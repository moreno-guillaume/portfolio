export default [
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Variables globales du navigateur
        window: "readonly",
        document: "readonly",
        console: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        getComputedStyle: "readonly",
        Date: "readonly",
        Math: "readonly",
        Set: "readonly",
        Map: "readonly",
        
        // Variables spécifiques à votre projet
        App: "writable",
        DebugUtils: "writable"
      }
    },
    rules: {
      // Erreurs critiques (bloquantes)
      "no-undef": "error",
      "no-unused-vars": ["error", { 
        "args": "none", 
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }],
      "no-unreachable": "error",
      "no-console": "off",
      "no-debugger": "warn",
      
      // Blocs vides - configuré pour être plus permissif
      "no-empty": ["warn", { "allowEmptyCatch": true }],
      
      // Style (warnings - Prettier s'en occupe)
      "semi": ["warn", "always"],
      "quotes": ["warn", "single"],
      
      // Bonnes pratiques
      "eqeqeq": ["warn", "always"],
      "no-var": "warn",
      "prefer-const": "warn",
      "no-eval": "error",
      "no-implied-eval": "error",
      
      // Compatibilité moderne
      "no-global-assign": "error",
      "no-implicit-globals": "error"
    }
  },
  {
    // Ignorer certains fichiers
    ignores: [
      "node_modules/",
      "vendor/",
      "var/",
      "public/build/",
      "**/*.min.js"
    ]
  }
];