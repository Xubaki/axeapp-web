/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#C17F24", light: "#D4A017", dark: "#9A6318" },
        secondary: { DEFAULT: "#4A6741", light: "#5C7D52", dark: "#354D2F" },
        accent: { DEFAULT: "#2D4A28", light: "#3D6B35", dark: "#1E3A1A" },
        background: "#FAF7F0",
        surface: "#FFFFFF",
        foreground: "#1A0A00",
        muted: "#6B7280",
        border: "#E5DFD0",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};


