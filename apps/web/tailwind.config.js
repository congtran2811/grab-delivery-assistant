/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grab: '#00B14F',
        grabDark: '#009040'
      }
    },
  },
  plugins: [],
}
