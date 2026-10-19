const js = require("@eslint/js");

// Aplica reglas recomendadas a los módulos CommonJS de la aplicación y scripts.
module.exports = [
  {
    files: ["src/**/*.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        __dirname: "readonly",
        module: "readonly",
        process: "readonly",
        require: "readonly",
      },
    },
    rules: js.configs.recommended.rules,
  },
];
