/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#C9A84C',
        'gold-light': '#d4af37',
        'gold-dark': '#b8942f',
        primary: {
          50: '#FBF7ED',
          100: '#F5EBD1',
          200: '#EAD8A3',
          300: '#E3C87F',
          400: '#D6B461',
          500: '#C9A84C',
          600: '#B8942F',
          700: '#96762A',
          800: '#785E22',
          900: '#5C481A',
        },
      }
    },
  },
  plugins: [],
}