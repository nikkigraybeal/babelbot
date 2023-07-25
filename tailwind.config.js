/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      height: {
        'chat-container': '34rem',
      },
      width: {
        '96p': '96%', 
      },
      minWidth: {
        '300': '15.5rem',
      },
      colors: {
        'bg-dark': '#11243C',
        'bg-light': '#2C455A',
        'chat-container-dark': '#3479BB',
        'chat-container-light': '#295C97',
        'micbox-light': '#3D89D8',
        'micbox-dark': '#306BB1',
        'light-blue': '#13ABCB',
      },
      borderRadius: {
        'chat-bubble': "30px"
      },
    },
  },
  plugins: [],
}
