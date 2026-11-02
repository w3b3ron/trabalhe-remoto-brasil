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
        // Paleta Apple HIG refinada
        // Light mode
        'bg-page': '#F5F5F7',
        'bg-surface': '#FFFFFF',
        'text-primary': '#1D1D1F',
        'text-secondary': '#515154',
        'text-tertiary': '#6E6E73',
        'border-divider': '#E8E8ED',
        'border-button': '#D2D2D7',

        // Accent
        accent: {
          DEFAULT: '#0A57D8',
          hover: '#0041A8',
          light: '#E8F0FE',
          text: '#0A47A9',
        },

        // Chips
        chip: {
          contract: { bg: '#E8F0FE', text: '#0A47A9' },
          modality: { bg: '#E3F6EA', text: '#0E5A32' },
          neutral: { bg: '#F0F0F3', text: '#3A3A3C' },
        },

        // Dark mode (via .dark class)
        dark: {
          'bg-page': '#0B0B0D',
          'bg-surface': '#1C1C1E',
          'text-primary': '#F5F5F7',
          'text-secondary': '#B0B0B4',
          'text-tertiary': '#8E8E93',
          'border-divider': '#2C2C2E',
          'border-button': '#3A3A3C',
          accent: {
            DEFAULT: '#0A84FF',
            hover: '#409CFF',
            light: '#1A3A5C',
            text: '#64A8FF',
          },
          chip: {
            contract: { bg: '#1A3A5C', text: '#64A8FF' },
            modality: { bg: '#1A3A2E', text: '#4CD964' },
            neutral: { bg: '#2C2C2E', text: '#D1D1D6' },
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Tamanhos específicos do design
        'title-card': ['21px', { lineHeight: '1.25', fontWeight: '700' }],
        'title-detail': ['clamp(28px, 4vw, 40px)', { lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.03em' }],
        'section-h2': ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        'label-sm': ['12px', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }],
        'body-sm': ['15px', { lineHeight: '1.55' }],
        'body-base': ['17px', { lineHeight: '1.55' }],
        'salary-card': ['17px', { lineHeight: '1.4', fontWeight: '700' }],
        'salary-detail': ['28px', { lineHeight: '1.2', fontWeight: '800' }],
      },
      borderRadius: {
        'card': '24px',      // 24px para cards
        'chip': '8px',       // 8px para chips
        'pill': '999px',     // 999px para pílulas/botões
        'company-card': '16px', // 16px para bloco empresa
        'detail-card': '28px',  // 28px para card de detalhe
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-detail': '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        'container-padding': '32px',
        'container-max': '1200px',
      },
      transitionDuration: {
        'card': '250ms',
        'chevron': '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
