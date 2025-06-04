/*const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} * /
module.exports = {
  darkMode: ["class"],
  content: [
    "./components/** /*.{ts,tsx}",
    "./app/** /*.{ts,tsx}",
    "./src/** /*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1225px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-simplon-norm)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-simplon-mono)", ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
};
*/

const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1225px",
      },
    },
    extend: {
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // Accent Colors
        'light-gold': 'var(--light-gold)',
        'dark-slate-grey': 'var(--dark-slate-grey)',
        'gunmetal': 'var(--gunmetal)',
        'cerulean': 'var(--cerulean)',
        'columbia-blue': 'var(--columbia-blue)',

        // Tone Colors
        'grey-50': 'var(--grey-50)',
        'grey-100': 'var(--grey-100)',
        'grey-450': 'var(--grey-450)',
      },
      fontFamily: {
        //sans: ["var(--font-simplon-norm)", ...defaultTheme.fontFamily.sans],
        //mono: ["var(--font-simplon-mono)", ...defaultTheme.fontFamily.mono],
        sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
        optima: ['var(--font-optima)', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
};