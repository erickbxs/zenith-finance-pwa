/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          // Light Mode
          lightBg: '#F2F2F7',
          lightCard: '#FFFFFF',
          lightDivider: '#E5E5EA',
          lightText: '#000000',
          lightSecondary: '#8E8E93',

          // Dark Mode (Deep Night Blue)
          darkBg: '#0B132B',
          darkBgAlt: '#0D1B2A',
          darkCard: '#1C2541',
          darkDivider: '#2C3E50',
          darkText: '#F8F9FA',
          darkSecondary: '#8D99AE',

          // Semantic iOS Accents
          incomeLight: '#34C759',
          incomeDark: '#30D158',
          expenseLight: '#FF3B30',
          expenseDark: '#FF453A',
          tintLight: '#007AFF',
          tintDark: '#0A84FF',
        }
      },
      borderRadius: {
        'squircle-card': '20px',
        'squircle-btn': '12px',
        'squircle-modal': '28px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'apple-card-dark': '0 8px 24px -4px rgba(0, 0, 0, 0.35)',
        'apple-modal': '0 20px 40px -8px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
};
