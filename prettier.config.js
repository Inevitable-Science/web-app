// prettier.config.js or .prettierrc.js

/** @type {import("prettier").Config} */
module.exports = {
  // General Formatting
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,

  // Quotes & Brackets
  singleQuote: false,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  bracketSpacing: true,

  // Commas & Parentheses
  trailingComma: "es5",
  arrowParens: "always",

  plugins: ["prettier-plugin-tailwindcss"],
};