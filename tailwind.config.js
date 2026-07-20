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
        primary: { DEFAULT: "#8B4513", light: "#A0522D", dark: "#6B3410" },
        secondary: { DEFAULT: "#D4AF37", light: "#F0C040", dark: "#B8960C" },
        accent: { DEFAULT: "#2D5016", light: "#3D6B1F", dark: "#1E3A0F" },
        background: "#FAFAF7",
        surface: "#FFFFFF",
        foreground: "#1A1A1A",
        muted: "#6B7280",
        border: "#E5E7EB",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};


