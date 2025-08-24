// eslint-disable-next-line no-undef
const withMT = require('@material-tailwind/react/utils/withMT');

export default withMT({
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      
    },
  },
  plugins: [],
});
