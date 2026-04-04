/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        accents: {
          1: 'var(--accents-1)',
          2: 'var(--accents-2)',
          3: 'var(--accents-3)',
          4: 'var(--accents-4)',
          5: 'var(--accents-5)',
          6: 'var(--accents-6)',
          7: 'var(--accents-7)',
          8: 'var(--accents-8)',
        },
        geist: {
          success: 'var(--geist-success)',
          error: 'var(--geist-error)',
          warning: 'var(--geist-warning)',
          link: 'var(--geist-link)',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        geist: '8px',
        '2xl': '16px',
      },
      boxShadow: {
        'geist': '0 0 0 1px var(--accents-2), 0 8px 30px rgba(0,0,0,0.12)',
        'geist-sm': '0 0 0 1px var(--accents-2), 0 2px 4px rgba(0,0,0,0.02)',
      }
    },
  },
  plugins: [],
}
