/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#07040d',
        'void-2': '#0b0714',
        panel: '#120a20',
        'panel-2': '#1a0f31',
        stroke: 'rgba(178, 107, 255, 0.18)',
        'stroke-2': 'rgba(178, 107, 255, 0.34)',
        violet: {
          DEFAULT: '#8a2be2',
          2: '#a855f7',
          glow: '#b98bff',
          deep: '#3d1170',
        },
        magenta: '#ff3ec8',
        'cyan-hint': '#6ee7ff',
        'text-hi': '#f6f0ff',
        'text-mid': '#c8b9e8',
        'text-low': '#8577a6',
        success: '#35e0a1',
        danger: '#ff5c7a',
      },
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '26px',
      },
    },
  },
  plugins: [],
}
