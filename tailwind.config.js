/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#4B1D8F",
          violet: "#6838D3",
          deep: "#2E145C",
          orange: "#FF6B1A",
          orangeHover: "#E9550C",
          lavender: "#F4F0FF",
          lavenderLight: "#FAF8FF",
          charcoal: "#1F2430",
          secondary: "#667085",
          gray: "#F3F5F8",
          white: "#FFFFFF",
          offwhite: "#FCFCFE",
        },
        // Semantic color system mapped to the vibrant palette
        canvas: {
          DEFAULT: "#FFFFFF",
          light: "#FCFCFE",
          dark: "#F3F5F8",
        },
        plum: {
          DEFAULT: "#4B1D8F",
          light: "#6838D3",
          dark: "#2E145C",
          muted: "#F4F0FF",
        },
        gold: {
          DEFAULT: "#FF6B1A",
          light: "#FF8C4A",
          dark: "#E9550C",
          muted: "#FFF1E8",
        },
        sage: {
          DEFAULT: "#F4F0FF",
          light: "#FAF8FF",
          dark: "#4B1D8F",
          muted: "#E7DCFC",
        },
        ink: {
          DEFAULT: "#1F2430",
          muted: "#667085",
          faint: "#9AA4B2",
          border: "#E8ECEF",
        },
      },
      fontFamily: {
        sora: ["var(--font-sora)", "Sora", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-sora)", "Sora", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px -2px rgba(31, 36, 48, 0.04)",
        card: "0 8px 30px -4px rgba(31, 36, 48, 0.07)",
        elevated: "0 20px 48px -12px rgba(75, 29, 143, 0.12)",
        "orange-glow": "0 8px 24px -4px rgba(255, 107, 26, 0.35)",
        "purple-glow": "0 8px 24px -4px rgba(104, 56, 211, 0.35)",
      },
      borderRadius: {
        brand: "16px",
      },
    },
  },
  plugins: [],
};
