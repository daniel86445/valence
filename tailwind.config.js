/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#050A14', panel: '#0B1526', panel2: '#11203A', line: '#1E3456',
        ink: '#EAF2FF', mute: '#8FA3C4', cyan: { DEFAULT: '#3DE8FF', dark: '#1C7FD6', light: '#B8F6FF', deep: '#0B2A33' },
        amber: { DEFAULT: '#FFB020', dark: '#8A5A00', light: '#FFE3A3', deep: '#2A1E08' }, violet: '#B48CFF', gold: '#FFD27A',
      },
      fontFamily: { pixel: ['"Pixelify Sans"', 'sans-serif'], tag: ['Silkscreen', 'sans-serif'], body: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}
