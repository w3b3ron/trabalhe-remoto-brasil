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
        // Paleta Apple HIG refinada - Clareza
        background: {
          DEFAULT: '#F5F5F7',
          dark: '#0B0B0D',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1C1C1E',
        },
        text: {
          primary: '#1D1D1F',
          secondary: '#515154',
          discreet: '#6E6E73',
          dark: {
            primary: '#F5F5F7',
            secondary: '#A1A1A6',
          },
        },
        divider: '#E8E8ED',
        border: '#D2D2D7',
        accent: {
          DEFAULT: '#0A57D8',
          hover: '#0948C8',
        },
        // Chips
        chip: {
          contract: {
            bg: '#E8F0FE',
            text: '#0A47A9',
          },
          modality: {
            bg: '#E3F6EA',
            text: '#0E5A32',
          },
          neutral: {
            bg: '#F0F0F3',
            text: '#3A3A3C',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'chip': '8px',
        'pill': '999px',
        'app-card': '24px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.04)',
        'app-card': '0 1px 2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
