const c = (v) => `rgb(var(--${v}) / <alpha-value>)`;
const scale = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, c(v)]));
module.exports = {
  plugins: [({ addVariant }) => {
    addVariant('mobile', 'html[data-device="mobile"] &');
    addVariant('desktop', 'html[data-device="desktop"] &');
  }],
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'], display: ['Fraunces', 'Georgia', 'serif'] },
      colors: {
        page: c('bg'), white: c('w'), hl: c('hl'), accent: c('acc'), accent2: c('acc2'),
        slate: scale({ 50: 's50', 100: 's100', 200: 's200', 300: 's300', 400: 's400', 500: 's500', 600: 's600', 700: 's700', 800: 's800', 900: 's900' }),
        indigo: scale({ 50: 'a50', 100: 'a100', 200: 'a200', 300: 'a200', 400: 'a600', 500: 'a600', 600: 'a600', 700: 'a700', 800: 'a700', 900: 'a700' }),
        violet: scale({ 50: 'a50', 100: 'a100', 200: 'a200', 500: 'acc2', 600: 'acc2', 700: 'a700' }),
        rose: { ...scale({ 50: 'r50', 100: 'r100', 200: 'r200', 700: 'r700' }), 500: '#f43f5e', 600: '#e11d48' },
        amber: { ...scale({ 50: 'm50', 100: 'm100', 200: 'm200', 700: 'm700' }), 500: '#f59e0b', 600: '#d97706' },
        emerald: { ...scale({ 50: 'e50', 100: 'e100', 200: 'e200', 700: 'e700' }), 500: '#10b981', 600: '#059669' },
      },
      boxShadow: {
        '2xs': '0 1px 1px rgb(0 0 0 / .05)', xs: '0 1px 2px rgb(0 0 0 / .08)',
        glow: '0 1px 2px rgb(0 0 0 / .12)', soft: '0 1px 2px rgb(0 0 0 / .05), 0 8px 24px -12px rgb(0 0 0 / .18)',
      },
      borderRadius: { xs: '4px', xl: '0.625rem', '2xl': '0.875rem', '3xl': '1rem' }, blur: { xs: '2px' },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        pop: { from: { opacity: 0, transform: 'translateY(12px) scale(.97)' }, to: { opacity: 1, transform: 'none' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: { fadeIn: 'fadeIn .2s ease-out', pop: 'pop .3s cubic-bezier(.2,.8,.2,1)', float: 'float 6s ease-in-out infinite' },
    },
  },
};
