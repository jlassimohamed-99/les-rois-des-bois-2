/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffef5',
          100: '#fffce0',
          200: '#fff9cc',
          300: '#fff6b8',
          400: '#fff3a4',
          500: '#FFD700', // Pure gold - main color #FFD700
          600: '#FFD700', // Use same #FFD700 for buttons and accent text
          700: '#E6C200', // Slightly darker for hover states (visible hover effect)
          800: '#CCAD00', // Darker variant for some accents
          900: '#B39800', // Darkest variant
        },
      },
    },
  },
  plugins: [],
}

