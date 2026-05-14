import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6C47FF",
          50: "#F3F0FF",
          100: "#E9E3FF",
          500: "#6C47FF",
          600: "#5835F0",
          700: "#4627D6",
        },
        surface: {
          DEFAULT: "#0F0F12",
          card: "#18181E",
          border: "#26262F",
        },
      },
      fontFamily: {
        display: ["var(--font-cal)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        fadeIn: "fadeIn 0.4s ease forwards",
      },
    },
  },
  plugins: [],
};
export default config;
