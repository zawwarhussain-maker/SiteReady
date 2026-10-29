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
        navy: {
          DEFAULT: '#16324F',
          dark: '#0F2236',
          surface: '#EFF4FF',
          deep: '#001D37',
        },
        teal: {
          DEFAULT: '#168C82',
          light: '#E6F5F3',
          dark: '#006A62',
        },
        amber: {
          DEFAULT: '#F2B544',
          light: '#FEF8EC',
          dark: '#B45309',
        },
        danger: {
          DEFAULT: '#C83E4D',
          light: '#FDECEE',
          dark: '#93000A',
        },
        slate: {
          bg: '#F5F7FA',
          card: '#FFFFFF',
          textPrimary: '#172B3A',
          textSecondary: '#64748B',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
