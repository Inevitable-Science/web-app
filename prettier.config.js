// prettier.config.js or .prettierrc.js

/** @type {import("prettier").Config} */
const config = {
  // General Formatting
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,

  // Quotes & Brackets
  singleQuote: true,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  bracketSpacing: true,

  // Commas & Parentheses
  trailingComma: "es5",
  arrowParens: "always",

  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;