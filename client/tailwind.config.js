/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        soil: {
          50: '#f7f5ef',
          100: '#ede7d9',
          700: '#6d5840',
        },
      },
    },
  },
  plugins: [],
};
