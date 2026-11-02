/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sap: {
          shell: '#111e38', // ShellBar Navy
          shellHover: '#1c2d50',
          blue: '#0070f2',
          blueDark: '#0854a0',
          blueLight: '#e5f0ff',
          bg: '#f3f5f8',
          card: '#ffffff',
          border: '#d9e0e8',
          text: '#223548',
          textMuted: '#5d6f80',
          success: '#107e3e',
          successBg: '#edf8f2',
          warning: '#c45e00',
          warningBg: '#fff4e6',
          error: '#b00020',
          errorBg: '#fdeded',
          badge: '#eef2f6',
        }
      },
      fontFamily: {
        sans: [
          '72',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
