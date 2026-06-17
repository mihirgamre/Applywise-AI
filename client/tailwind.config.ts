import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        brand: "#176B5B",
        accent: "#D97706"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 32, 38, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
