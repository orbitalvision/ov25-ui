/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  prefix: 'ov25-configurator',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['var(--ov25-text-xs-size)', { lineHeight: 'var(--ov25-text-xs-line-height)' }],
        'sm': ['var(--ov25-text-sm-size)', { lineHeight: 'var(--ov25-text-sm-line-height)' }],
        'base': ['var(--ov25-text-base-size)', { lineHeight: 'var(--ov25-text-base-line-height)' }],
        'lg': ['var(--ov25-text-lg-size)', { lineHeight: 'var(--ov25-text-lg-line-height)' }],
        'xl': ['var(--ov25-text-xl-size)', { lineHeight: 'var(--ov25-text-xl-line-height)' }],
        '2xl': ['var(--ov25-text-2xl-size)', { lineHeight: 'var(--ov25-text-2xl-line-height)' }],
        '3xl': ['var(--ov25-text-3xl-size)', { lineHeight: 'var(--ov25-text-3xl-line-height)' }],
        '4xl': ['var(--ov25-text-4xl-size)', { lineHeight: 'var(--ov25-text-4xl-line-height)' }],
        '5xl': ['var(--ov25-text-5xl-size)', { lineHeight: 'var(--ov25-text-5xl-line-height)' }],
        '6xl': ['var(--ov25-text-6xl-size)', { lineHeight: 'var(--ov25-text-6xl-line-height)' }],
        '7xl': ['var(--ov25-text-7xl-size)', { lineHeight: 'var(--ov25-text-7xl-line-height)' }],
        '8xl': ['var(--ov25-text-8xl-size)', { lineHeight: 'var(--ov25-text-8xl-line-height)' }],
        '9xl': ['var(--ov25-text-9xl-size)', { lineHeight: 'var(--ov25-text-9xl-line-height)' }],
      },
    },
  },
  plugins: [],
}; 