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
        "surface-canvas": "#F8FAFC",
        "surface-card": "#FFFFFF",
        "surface-subtle": "#F1F5F9",
        "surface-dim": "#cbdbf5",
        "charcoal-accent": "#0F172A",
        "charcoal-muted": "#1E293B",
        "border-clean": "#E2E8F0",
        "border-strong": "#CBD5E1",
        "primary": "#0F172A",
        "primary-container": "#131b2e",
        "on-primary-container": "#7c839b",
        "secondary": "#B45309",
        "secondary-container": "#fe932c",
        "on-secondary-container": "#663500",
        "gold-light": "#F59E0B",
        "gold-subtle": "#FEF3C7",
        "status-verified": "#059669",
        "status-verified-bg": "#ECFDF5",
        "status-alert": "#EF4444",
        "status-alert-bg": "#FEF2F2",
        "outline": "#64748B",
        "on-surface": "#0F172A",
        "on-surface-variant": "#475569",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
      },
      fontFamily: {
        headline: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(15, 23, 42, 0.03)",
        sm: "0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)",
        md: "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)",
        lg: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)",
        xl: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
        drawer: "-8px 0 24px -4px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
