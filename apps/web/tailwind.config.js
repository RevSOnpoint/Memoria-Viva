/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef1eb',
          100: '#dde6e0',
          200: '#c7d3cd',
          300: '#a8c5b8',
          400: '#7fa99a',
          500: '#4f7c6e',
          600: '#2f5d50',
          700: '#254a40',
          800: '#1f3f36',
          900: '#182924',
        },
        ink: {
          DEFAULT: '#1d2b28',
          soft: '#344a43',
          muted: '#5a6b64',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f7f7f3',
          muted: '#eef1eb',
        },
        line: {
          DEFAULT: '#dde3dc',
          strong: '#aebbb3',
        },
        success: '#2c6e4f',
        danger: '#a34a3d',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: [
          '"Public Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
