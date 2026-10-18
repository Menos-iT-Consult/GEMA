import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A1931",
          900: "#10254E",
          800: "#1A365D",
          700: "#243B6B"
        },
        royal: {
          600: "#1D4ED8",
          500: "#2563EB",
          400: "#3B82F6",
          100: "#DBEAFE",
          50: "#EFF6FF"
        },
        ochre: {
          600: "#B45309",
          500: "#D97706",
          400: "#F59E0B",
          300: "#FCD34D",
          100: "#FEF3C7",
          50: "#FFFBEB"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"]
      }
    }
  },
  plugins: []
};
export default config;
