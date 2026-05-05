/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        app: '#0d0d0d',
        surface: '#171717',
        elevated: '#1f1f1f',
        border: '#2a2a2a',
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
    },
  },
}
