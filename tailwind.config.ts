/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "neon-primary": "#10F7A5",
        "neon-secondary": "#22D3EE",
        "neon-gold": "#FDE047",
      },
      dropShadow: {
        neon: [
          "0 0 12px rgba(16,247,165,0.55)",
          "0 0 24px rgba(34,211,238,0.35)",
        ],
      },
      boxShadow: {
        glass: "0 8px 28px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
