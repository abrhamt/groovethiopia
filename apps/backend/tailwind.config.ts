import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Groovethiopia brand palette — Deep Black + Warm Gold
        background: "#0a0a0a",
        foreground: "#f5f5f5",
        gold: {
          50: "#fdf9ed",
          100: "#faf0d0",
          200: "#f4dfa0",
          300: "#eec96c",
          400: "#e8b240",
          500: "#d49520", // primary gold
          600: "#b87818",
          700: "#945a14",
          800: "#724412",
          900: "#523110",
        },
        ink: {
          50: "#f5f5f5",
          100: "#e5e5e5",
          200: "#cccccc",
          300: "#a3a3a3",
          400: "#737373",
          500: "#525252",
          600: "#404040",
          700: "#2d2d2d",
          800: "#1a1a1a",
          900: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sohne)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-editorial)", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-up": "fadeUp 0.8s ease-out",
        "slide-in": "slideIn 0.5s ease-out",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;