/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#3498db',
        'secondary-yellow': '#f1c40f',
        'dark-gray': '#2c3e50',
        'custom-red': '#e74c3c',
      },

    },
  },
  plugins: [],
}

