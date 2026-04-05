/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "paper-bg": "#FBFBF5",
        "ink-dark": "#102A6F",
        "ink-charcoal": "#333333",
        "marker-red": "#B22222",
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          900: "#134e4a"
        },
        ink: "#0f172a",
        shell: "#09111f"
      },
      boxShadow: {
        fab: "4px 4px 0 rgba(16, 42, 111, 0.18)",
        paper: "4px 4px 0 rgba(51, 51, 51, 0.18)"
      },
      fontFamily: {
        sans: ["'Patrick Hand'", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["'Kalam'", "'Patrick Hand'", "cursive"],
        body: ["'Patrick Hand'", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
