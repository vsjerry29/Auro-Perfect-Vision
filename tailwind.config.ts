import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#F8F5F0",
          light: "#FCFAF7",
          dark: "#EFE9DE",
        },
        plum: {
          DEFAULT: "#432747",
          light: "#5A365F",
          dark: "#2F1B32",
          muted: "#F3EEF4",
        },
        gold: {
          DEFAULT: "#BA9453",
          light: "#CEAE74",
          dark: "#98753B",
          muted: "#F7F3EB",
        },
        sage: {
          DEFAULT: "#E8EDE6",
          light: "#F2F6F1",
          dark: "#3F523E",
          muted: "#D5DFD2",
        },
        ink: {
          DEFAULT: "#2E2435",
          muted: "#6B6270",
          faint: "#A59EA9",
          border: "#E2DDD6",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-dmsans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 8px -2px rgba(46, 36, 53, 0.05)",
        card: "0 8px 24px -4px rgba(46, 36, 53, 0.07)",
        elevated: "0 20px 48px -12px rgba(46, 36, 53, 0.15)",
      },
      borderRadius: {
        brand: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
