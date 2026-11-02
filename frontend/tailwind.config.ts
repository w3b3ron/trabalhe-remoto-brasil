import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta neutra inspirada na Apple HIG
        surface: {
          light: '#FFFFFF',
          dark: '#1C1C1E',
        },
        accent: {
          DEFAULT: '#0A84FF', // iOS Blue
          hover: '#0071E3',
        },
        'text-primary': {
          light: '#1D1D1F',
          dark: '#F5F5F7',
        },
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Inter',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        'app-card': '1.25rem', // 20px radius estilo iOS
      },
      boxShadow: {
        'app-card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'app-card-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
