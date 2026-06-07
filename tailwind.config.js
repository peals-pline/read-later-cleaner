/** @type {import('tailwindcss').Config} */
export default {
  content: ['./popup.html', './options.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fbf7f0',
        ink: '#181514',
        muted: '#746d66',
        rule: '#e7ded2',
        ember: '#df2f14',
        emberDark: '#b92612',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        editorial: '0 24px 80px rgba(55, 40, 27, 0.14)',
      },
    },
  },
  plugins: [],
}
