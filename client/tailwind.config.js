/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
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
        fab: "0 20px 40px rgba(20, 184, 166, 0.30)"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
