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
        bg: "#0f172a",
        surface: "#1e293b",
        "surface-hover": "#334155",
        border: "#334155",
        primary: "#22c55e",
        "primary-hover": "#16a34a",
        "primary-muted": "rgba(34, 197, 94, 0.12)",
        "text": "#f8fafc",
        "text-secondary": "#94a3b8",
        "text-muted": "#64748b",
        "progress-track": "#334155",
        danger: "#ef4444",
        "danger-muted": "rgba(239, 68, 68, 0.12)",
      },
      fontFamily: {
        display: ["var(--font-lexend)", "var(--font-heebo)", "sans-serif"],
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
