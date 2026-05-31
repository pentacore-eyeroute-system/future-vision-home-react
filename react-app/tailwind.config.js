/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#95ab2f',
        'primary-dark': '#4d5a1b',
        'primary-light': '#7d8a2d',
      },
    },
  },
  plugins: [],
}
