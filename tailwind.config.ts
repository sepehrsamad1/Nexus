import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "#121217",
          hover: "#18181f",
          border: "#27272a",
        },
        metascore: {
          high: "#10b981", // Emerald 500 (75-100)
          mid: "#f59e0b",  // Amber 500 (50-74)
          low: "#f43f5e",  // Rose 500 (0-49)
        },
        brand: {
          indigo: "#6366f1",
          cyan: "#06b6d4",
        },
      },
    },
  },
  plugins: [],
};

export default config;
