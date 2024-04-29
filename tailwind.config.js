/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['public/**/*.html', './src/**/*.{html,js,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
