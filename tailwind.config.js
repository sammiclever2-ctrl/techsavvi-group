/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.html", "./src/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1A2B",
        navy: { 900: "#07142E", 800: "#0B1F45", 700: "#12306B" },
        brand: { DEFAULT: "#1E40AF", 500: "#3B82F6", 400: "#38BDF8", 50: "#EFF6FF" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Instrument Sans"', "Inter", "system-ui", "sans-serif"],
      },
      maxWidth: { site: "76rem" },
    },
  },
  plugins: [],
};
