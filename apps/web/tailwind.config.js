/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#faf7f2',         // Lienzo cálido arena / pergamino suave
          card: '#ffffff',       // Fondo de tarjeta nítido
          cream: '#f4ede2',      // Crema suave para paneles
          border: '#e3d9cb',     // Borde cálido sutil
          borderDark: '#bfae97', // Borde con alto contraste
          woodDark: '#2a1a0f',   // Madera oscura / café tostado
          wood: '#442a17',       // Madera noble
          woodLight: '#694326',  // Tono madera claro
          amber: '#c05600',      // Ámbar soleado / terracota cálido
          amberHover: '#9f4600', // Ámbar tostado al hover
          amberLight: '#fef6ee', // Resaltado ámbar suave
          text: '#261b12',       // Texto café profundo de altísima legibilidad
          textMuted: '#665546',  // Texto secundario cálido
          success: '#1b6e39',    // Verde hoja natural
          successBg: '#f0f8f2',
          error: '#a81c1c',      // Rojo ladrillo
          errorBg: '#fdf2f2',
        }
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
