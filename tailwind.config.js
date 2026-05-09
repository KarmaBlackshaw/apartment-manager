/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#3B82F6',
          pressed: '#2563EB',
          muted:   '#1D4ED8',
          subtle:  '#0C1A3D',
        },

        // Surfaces
        background: '#0D0D0D',
        surface:    '#171717',
        elevated:   '#1F1F1F',
        overlay:    'rgba(0,0,0,0.6)',
        muted:      '#242424',

        // Borders
        border:         '#2A2A2A',
        'border-focus': '#3B82F6',

        // Text
        text: {
          primary:   '#F1F5F9',
          secondary: '#94A3B8',
          muted:     '#64748B',
          inverse:   '#0F172A',
          link:      '#3B82F6',
        },

        // Status
        success: { DEFAULT: '#10B981', bg: '#052E16', text: '#6EE7B7', subtle: 'rgba(16,185,129,0.12)' },
        warning: { DEFAULT: '#F59E0B', bg: '#1C1005', text: '#FCD34D', subtle: 'rgba(245,158,11,0.12)' },
        danger:  { DEFAULT: '#EF4444', bg: '#200C0C', text: '#FCA5A5', subtle: 'rgba(239,68,68,0.12)' },
        info:    { DEFAULT: '#3B82F6', bg: '#0C1A3D', text: '#93C5FD', subtle: 'rgba(59,130,246,0.12)' },
        neutral: { DEFAULT: '#64748B', bg: '#1E2533', text: '#94A3B8' },
        purple:  { DEFAULT: '#8B5CF6', subtle: 'rgba(139,92,246,0.12)' },
        teal:    { DEFAULT: '#14B8A6', subtle: 'rgba(20,184,166,0.12)' },

        // Balance states
        balance: {
          zero:   '#10B981',
          owed:   '#EF4444',
          credit: '#3B82F6',
        },
      },

      fontSize: {
        'screen-title':   ['24px', { lineHeight: '29px', letterSpacing: '-0.5px' }],
        'section-header': ['18px', { lineHeight: '24px', letterSpacing: '-0.3px' }],
        'card-title':     ['16px', { lineHeight: '22px', letterSpacing: '-0.2px' }],
        'body':           ['15px', { lineHeight: '22px', letterSpacing: '0px'    }],
        'label':          ['13px', { lineHeight: '18px', letterSpacing: '0.2px'  }],
        'caption':        ['12px', { lineHeight: '16px', letterSpacing: '0.1px'  }],
        'amount-large':   ['28px', { lineHeight: '34px', letterSpacing: '-0.5px' }],
        'amount-medium':  ['20px', { lineHeight: '26px', letterSpacing: '-0.3px' }],
        'amount-small':   ['15px', { lineHeight: '20px', letterSpacing: '0px'    }],
        'chip-label':     ['11px', { lineHeight: '14px', letterSpacing: '0.5px'  }],
        'tab-label':      ['10px', { lineHeight: '13px', letterSpacing: '0.3px'  }],
      },

      spacing: {
        1: '4px',  2: '8px',  3: '12px', 4: '16px',
        5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px',
      },

      borderRadius: {
        sm:   '6px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        pill: '999px',
      },

      fontWeight: {
        regular: '400', medium: '500', semibold: '600',
        bold: '700', extrabold: '800',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.text-align-vertical-top': { textAlignVertical: 'top' },
      })
    },
  ],
}
