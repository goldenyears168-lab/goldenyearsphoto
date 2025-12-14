/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{njk,html,js}",
    "./src/_includes/**/*.{njk,html}",
  ],
  theme: {
    extend: {
      // Color Tokens
      colors: {
        // ==================================================
        // ==================================================
        
        // Now using CSS Variables as single source of truth
        'trust': {
          50: 'var(--color-trust-50)',
          100: 'var(--color-trust-100)',
          200: 'var(--color-trust-200)',
          500: 'var(--color-trust-500)',
          600: 'var(--color-trust-600)',
          700: 'var(--color-trust-700)',
          800: 'var(--color-trust-800)',
          900: 'var(--color-trust-900)',
          950: 'var(--color-trust-950)',
        },
        
        // Now using CSS Variables as single source of truth
        'sand': {
          50: 'var(--color-sand-50)',
          100: 'var(--color-sand-100)',
          200: 'var(--color-sand-200)',
          300: 'var(--color-sand-300)',
        },
        
        // ==================================================
        // Kept for backward compatibility
        // Now using CSS Variables as single source of truth
        // ==================================================
        'brand-primary': 'var(--color-brand-primary)', // trust-950
        'brand-accent': 'var(--color-brand-accent)', // trust-800
        'brand-cta': 'var(--color-brand-cta)', // trust-200
        'brand-cta-hover': 'var(--color-brand-cta-hover)', // trust-800
        
        // Now using CSS Variables as single source of truth
        'accent': 'var(--color-accent)', // trust-800
        'accent-weak': 'var(--color-accent-weak)', // trust-600
        'accent-strong': 'var(--color-accent-strong)', // trust-950
        
        // Now using CSS Variables as single source of truth
        'neutral': {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)', // slate-500
          900: 'var(--color-neutral-900)', // trust-900
          950: 'var(--color-neutral-950)', // trust-950
        },
        
        // Now using CSS Variables as single source of truth
        'surface': 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)', // sand-100
        'surface-2': 'var(--color-surface-2)', // sand-50
        'surface-3': 'var(--color-surface-3)', // trust-950
        'surface-elevated': 'var(--color-surface-elevated)',
        
        // Now using CSS Variables as single source of truth
        'text': 'var(--color-text)', // slate-600
        'text-main': 'var(--color-text-main)', // trust-900
        'text-subtle': 'var(--color-text-subtle)', // slate-500
        'text-on-dark': 'var(--color-text-on-dark)', // trust-50
        'text-on-accent': 'var(--color-text-on-accent)',
        'text-link': 'var(--color-text-link)', // trust-600
        'text-link-hover': 'var(--color-text-link-hover)', // trust-800
        
        // Status Colors
        // Now using CSS Variables as single source of truth
        'success': 'var(--color-success)',
        'error': 'var(--color-error)',
        
        // Now using CSS Variables as single source of truth
        'border': 'var(--color-border)', // sand-200
        'border-strong': 'var(--color-border-strong)', // sand-300
        'border-subtle': 'var(--color-border-subtle)', // sand-100
        'border-dark': 'var(--color-border-dark)', // trust-900
        
        // Now using CSS Variables as single source of truth
        'dark': 'var(--color-dark)', // trust-950
        'cta': 'var(--color-cta)', // trust-200
        'primary-accent': 'var(--color-primary-accent)', // trust-800
        'gray-bg': 'var(--color-gray-bg)',
        'light-bg': 'var(--color-light-bg)', // sand-50
        'text-dark': 'var(--color-text-dark)', // trust-900
        'text-light': 'var(--color-text-light)', // trust-50
        'white': 'var(--color-white)',
        
        'dawn': {
          orange: '#FFF4E6',
          blue: '#F0F9FF',
          accent: '#FF8A65', // Not in Design System - consider removing
        },
      },
      
      // Typography
      fontFamily: {
        'base': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'heading': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'mono': ['"Space Mono"', '"SF Mono"', 'Monaco', '"Cascadia Code"', 'monospace'],
        'sans': ['"Plus Jakarta Sans"', '"Noto Sans TC"', 'sans-serif'],
        'serif': ['"Playfair Display"', 'serif'],
        'hand': ['"La Belle Aurore"', 'cursive'],
        'barcode': ['"Libre Barcode 39 Text"', 'cursive'],
      },
      
      fontSize: {
        'xxs': '0.625rem',  // 10px - 装饰性编号、票券细节
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
      },
      
      lineHeight: {
        'tight': '1.2',
        'normal': '1.3',
        'relaxed': '1.6',
        'loose': '1.7',
      },
      
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      
      spacing: {
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '7': '1.75rem',   // 28px
        '8': '2rem',      // 32px
        '9': '2.5rem',    // 40px
        '10': '3rem',     // 48px
        '12': '4rem',     // 64px
      },
      
      // Border Radius
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '20px',
        'full': '9999px',
        'button': '9999px',
        'card': '12px',
        'input': '8px',
        'image': '12px',
      },
      
      // Box Shadow
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'lg': '0 8px 25px rgba(0, 0, 0, 0.08)',
        'xl': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'soft': '0 12px 30px rgba(0, 0, 0, 0.06)',
        'hover': '0 18px 40px rgba(0, 0, 0, 0.12)',
        'card': '0 12px 30px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 18px 40px rgba(0, 0, 0, 0.12)',
        'button': '0 4px 15px rgba(230, 175, 46, 0.3)',
        'button-hover': '0 6px 20px rgba(230, 175, 46, 0.4)',
        'ghost-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'focus': '0 0 0 3px rgb(208 215 241 / 60%)',
        'hero': '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      
      // Layout Dimensions
      maxWidth: {
        'container': '1140px',
        'container-md': '900px',
      },
      
      height: {
        'header': '74px',
      },
      
      zIndex: {
        'header': '1000',
        'header-nav': '1001',
        'dropdown': '1002',
        'modal': '2000',
        'tooltip': '3000',
      },
      
      screens: {
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
      },
      
      // Transition durations
      transitionDuration: {
        'smooth': '180ms',
        'hover': '160ms',
      },
      
      transitionTimingFunction: {
        'smooth': 'ease-out',
      },
      
      // Background Images
      backgroundImage: {
        'dawn-gradient': 'linear-gradient(135deg, #F8FAFC 0%, #FDFBF7 60%, #F1F5F9 100%)',
        'paper-texture': 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.06\'/%3E%3C/svg%3E")',
        'ticket-split': 'repeating-linear-gradient(to bottom, #CBD5E1 0, #CBD5E1 8px, transparent 8px, transparent 16px)',
      },
      
      // Animations
      animation: {
        'stamp-in': 'stampIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      
      keyframes: {
        stampIn: {
          '0%': { opacity: '0', transform: 'scale(2) rotate(-15deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-6deg)' }
        }
      },
    },
  },
  plugins: [],
}

