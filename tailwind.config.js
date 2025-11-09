/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom Colors - Project Specific
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: '#6b7280',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        brand: {
          midnight: '#040f16',
          deep: '#0b1c1f',
          teal: '#0f9d8a',
          aqua: '#2dd4bf',
          accent: '#f4b860',
        },

        // Brand Colors
        guroosh: {
          teal: {
            light: '#5eead4',    // teal-300
            DEFAULT: '#2dd4bf',  // teal-400
            dark: '#14b8a6',     // teal-500
            darker: '#0d9488',   // teal-600
          },
          yellow: {
            DEFAULT: '#eab308',  // yellow-500
            light: '#fde047',    // yellow-300
          },
          purple: {
            DEFAULT: '#9333ea',  // purple-600
            light: '#a855f7',    // purple-500
          },
        },
        
        // Status Colors
        status: {
          pending: {
            bg: 'rgba(113, 63, 18, 0.3)',    // yellow-900/30
            text: '#fbbf24',                  // yellow-400
          },
          accepted: {
            bg: 'rgba(19, 78, 74, 0.3)',     // teal-900/30
            text: '#2dd4bf',                  // teal-400
          },
          active: {
            bg: 'rgba(30, 58, 138, 0.3)',    // blue-900/30
            text: '#60a5fa',                  // blue-400
          },
          completed: {
            bg: 'rgba(20, 83, 45, 0.3)',     // green-900/30
            text: '#4ade80',                  // green-400
          },
          declined: {
            bg: 'rgba(127, 29, 29, 0.3)',    // red-900/30
            text: '#f87171',                  // red-400
          },
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // Custom Background Images
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom right, #0f172a, #134e4a, #0f172a)',
        'gradient-card': 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(51, 65, 85, 0.5) 100%)',
      },

      // Custom Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },

      // Custom Border Radius
      borderRadius: {
        'card': '0.75rem',      // 12px
        'button': '0.5rem',     // 8px
        'input': '0.5rem',      // 8px
      },

      // Custom Box Shadows
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.2)',
        'glow-teal': '0 0 20px rgba(45, 212, 191, 0.3)',
        'glow-yellow': '0 0 20px rgba(234, 179, 8, 0.3)',
      },

      // Custom Transitions
      transitionDuration: {
        '400': '400ms',
      },

      // Custom Z-Index
      zIndex: {
        'modal': '1000',
        'dropdown': '900',
        'header': '800',
        'sidebar': '700',
      },

      // Custom Spacing (if needed)
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      // Custom Font Sizes
      fontSize: {
        'tiny': '0.625rem',     // 10px
      },

      // Custom Animation
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },

      // Custom Animation Delays
      animationDelay: {
        '0': '0ms',
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
    },
  },
  plugins: [],
}
