/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
        background: "#0F172A",
        card: "#1E293B",
      },
    },
  },
  plugins: [],
}
