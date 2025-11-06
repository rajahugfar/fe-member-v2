/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef5e7',
          100: '#fdebc4',
          200: '#fbd89d',
          300: '#f9c576',
          400: '#f7b659',
          500: '#f5a73c',
          600: '#f39c30',
          700: '#e88e24',
          800: '#de8018',
          900: '#cf6600',
        },
        dark: {
          50: '#e8eaf0',
          100: '#c5cad9',
          200: '#9fa8c0',
          300: '#7886a6',
          400: '#5b6c93',
          500: '#3e5280',
          600: '#364a76',
          700: '#2c3f69',
          800: '#23355d',
          900: '#132245',
        },
        // ZAKA88 Theme Colors (Gold/Brown)
        gold: {
          50: '#fefaf3',
          100: '#fdf4e1',
          200: '#fae8c3',
          300: '#f6dba5',
          400: '#f3cf87',
          500: '#C4A962', // Main gold
          600: '#b89a56',
          700: '#9d8349',
          800: '#826c3c',
          900: '#67552f',
        },
        brown: {
          50: '#f5f1ed',
          100: '#e6ded5',
          200: '#cec0b0',
          300: '#b5a28b',
          400: '#9d8466',
          500: '#8B7355', // Main brown
          600: '#7d674d',
          700: '#6a5741',
          800: '#574735',
          900: '#443729',
        },
        admin: {
          bg: '#1a1410', // Dark brown background
          card: '#2a2219', // Card background
          border: '#3a3129', // Border color
          hover: '#3a3129', // Hover state
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        display: ['Kanit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(245, 167, 60, 0.5)',
        'glow-lg': '0 0 40px rgba(245, 167, 60, 0.6)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spin-reverse 6s linear infinite',
        'loading-bar': 'loading-bar 2s ease-in-out infinite',
        'shimmer-fast': 'shimmer-fast 1.5s infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 167, 60, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 167, 60, 0.8)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'loading-bar': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        'shimmer-fast': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
