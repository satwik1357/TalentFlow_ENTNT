/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Base colors
        white: '#FFFFFF',
        black: '#1A1A1A',
        
        // Primary colors
        primary: {
          50: '#F0F5FF',
          100: '#E0EAFF',
          200: '#C7D7FE',
          300: '#A4BCFD',
          400: '#7E9AFB',
          500: '#5B7BF7', // Main primary color
          600: '#3B5BDB',
          700: '#2D4ACB',
          800: '#1F3AA3',
          900: '#142B7E',
          DEFAULT: '#5B7BF7',
          foreground: '#FFFFFF'
        },
        
        // Neutral colors
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        
        // Success colors
        success: {
          50: '#F0FDF4',
          500: '#10B981',
          700: '#047857',
        },
        
        // Warning colors
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          700: '#B45309',
        },
        
        // Error colors
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          700: '#B91C1C',
        },
        
        // Background and surface colors
        background: '#F8FAFC',
        surface: '#FFFFFF',
        
        // Text colors
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          disabled: '#94A3B8',
        },
        
        // Border colors
        border: {
          light: '#E2E8F0',
          DEFAULT: '#CBD5E1',
          dark: '#94A3B8',
        },
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        xs: '0px 1px 2px 0px rgba(15, 23, 42, 0.05)',
        sm: '0px 1px 3px 0px rgba(15, 23, 42, 0.10), 0px 1px 2px -1px rgba(15, 23, 42, 0.10)',
        DEFAULT: '0px 4px 6px -2px rgba(15, 23, 42, 0.03), 0px 2px 4px -2px rgba(15, 23, 42, 0.03)',
        md: '0px 10px 8px 0px rgba(15, 23, 42, 0.04), 0px 4px 3px 0px rgba(15, 23, 42, 0.10)',
        lg: '0px 10px 15px -3px rgba(15, 23, 42, 0.10), 0px 4px 6px -4px rgba(15, 23, 42, 0.10)',
        xl: '0px 20px 25px -5px rgba(15, 23, 42, 0.10), 0px 8px 10px -6px rgba(15, 23, 42, 0.10)',
        '2xl': '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(15, 23, 42, 0.05)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}
