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
          950: "#08081F",
          900: "#101B3D",
          800: "#182752",
          700: "#223668"
        },
        gema: {
          50: "#EFF8F6",
          100: "#D2EDE6",
          200: "#A5DCD2",
          300: "#53A496",
          400: "#369A89",
          500: "#1E8473",
          600: "#187766",
          700: "#106F5F",
          800: "#0A5A4C",
          900: "#031916"
        },
        royal: {
          700: "#31457F",
          600: "#3D5599",
          500: "#4C66AF",
          400: "#7288C7",
          100: "#DFE4F3",
          50: "#EFF2F9"
        },
        ochre: {
          700: "#A34A12",
          600: "#C25A15",
          500: "#F47728",
          400: "#F5904B",
          300: "#F3A879",
          100: "#F3DACA",
          50: "#FAEEE5"
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
