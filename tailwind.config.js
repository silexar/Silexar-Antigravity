/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      // ─── Neumorphic Color Palette ─────────────────────────────────────
      colors: {
        // Surfaces
        surface: {
          base:   '#F0EDE8',
          raised: '#F5F2EE',
          inset:  '#E8E5E0',
        },
        // Shadows
        shadow: {
          light: '#FFFFFF',
          dark:  '#D4D1CC',
        },
        // Brand
        primary: {
          50:  '#EEF3FD',
          100: '#D5E4FB',
          200: '#AACAF7',
          300: '#7FAFF3',
          400: '#5495EF',
          500: '#1D5AE8',  // Silexar blue
          600: '#1648BA',
          700: '#10368C',
          800: '#0B245E',
          900: '#051230',
          DEFAULT: '#1D5AE8',
        },
        // Semantic
        success: {
          50:  '#EAF2E3',
          100: '#C6DDB0',
          200: '#9DC87A',
          300: '#74B244',
          400: '#4E901E',
          500: '#3B6D11',
          DEFAULT: '#3B6D11',
        },
        warning: {
          50:  '#FEF6E8',
          100: '#FDE4B5',
          200: '#FBD07E',
          300: '#F9BC47',
          400: '#F4AB1E',
          500: '#EF9F27',
          DEFAULT: '#EF9F27',
        },
        danger: {
          50:  '#F7E6E6',
          100: '#EDB5B5',
          200: '#E08080',
          300: '#D44B4B',
          400: '#BF3535',
          500: '#A32D2D',
          DEFAULT: '#A32D2D',
        },
        ai: {
          50:  '#EDEAFF',
          100: '#D3CFFE',
          200: '#A49FFD',
          300: '#766FFC',
          400: '#6A60E8',
          500: '#534AB7',  // Wil/AI purple
          DEFAULT: '#534AB7',
        },
        // Text
        text: {
          primary:   '#2C2C2A',
          secondary: '#5F5E5A',
          tertiary:  '#888780',
        },
      },

      // ─── Neumorphic Box Shadows ───────────────────────────────────────
      boxShadow: {
        // Raised (elevated card/button)
        'neu-raised':    '6px 6px 14px #D4D1CC, -6px -6px 14px #FFFFFF',
        'neu-raised-sm': '4px 4px 10px #D4D1CC, -4px -4px 10px #FFFFFF',
        'neu-raised-xs': '2px 2px 6px #D4D1CC,  -2px -2px 6px #FFFFFF',
        // Inset (input, pressed)
        'neu-inset':     'inset 3px 3px 8px #D4D1CC, inset -3px -3px 8px #FFFFFF',
        'neu-inset-sm':  'inset 2px 2px 5px #D4D1CC, inset -2px -2px 5px #FFFFFF',
        'neu-pressed':   'inset 2px 2px 5px #D4D1CC, inset -2px -2px 5px #FFFFFF',
        // Focus ring
        'neu-focus':     '0 0 0 3px rgba(29, 90, 232, 0.25), 4px 4px 10px #D4D1CC, -4px -4px 10px #FFFFFF',
        // Flat (no depth)
        'neu-flat':      '0 0 0 transparent',
        // Dark mode variants
        'neu-dark-raised':  '6px 6px 14px #0a0a0a, -6px -6px 14px #2a2a2a',
        'neu-dark-inset':   'inset 3px 3px 8px #0a0a0a, inset -3px -3px 8px #2a2a2a',
        'neu-dark-pressed': 'inset 2px 2px 5px #0a0a0a, inset -2px -2px 5px #2a2a2a',
      },

      // ─── Background Colors (shorthand classes) ────────────────────────
      backgroundColor: {
        'neu-base':   '#F0EDE8',
        'neu-raised': '#F5F2EE',
        'neu-inset':  '#E8E5E0',
      },

      // ─── Border Radius ────────────────────────────────────────────────
      borderRadius: {
        'neu':    '16px',
        'neu-sm': '12px',
        'neu-xs': '8px',
        'neu-lg': '24px',
        'neu-xl': '32px',
      },

      // ─── Typography ───────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem',     { lineHeight: '1.5rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.5rem' }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },

      // ─── Transitions ──────────────────────────────────────────────────
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'neu': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ─── Z-Index scale ────────────────────────────────────────────────
      zIndex: {
        'nav':     '100',
        'modal':   '200',
        'tooltip': '300',
        'toast':   '400',
        'overlay': '500',
      },

      // ─── Animation ────────────────────────────────────────────────────
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },

      // ─── Screen breakpoints (mobile-first) ───────────────────────────
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl':'1536px',
      },
    },
  },
  plugins: [],
}
