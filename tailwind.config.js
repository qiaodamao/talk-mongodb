/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#333',
        accent: '#a4855e',
        'accent-dark': '#A88457',
        'accent-light': '#fcf1c3',
        surface: '#FAFAFA',
        card: '#FFFFFF',
        muted: '#999999',
        'text-main': '#1F2021',
        'text-link': '#666666',
        'text-light': '#CCC',
        'reply-bg': '#F7F8FB',
        'input-bg': '#eeeeee',
        'page-bg': '#ececec',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        brand: ['"BrandonText-Black"', '"PingFang SC"', 'sans-serif'],
        langdon: ['"Langdon"', 'serif'],
      },
      borderRadius: {
        'pill': '20px',
        'card': '12px',
      },
      boxShadow: {
        'card': '0 0 8px rgba(0,0,0,.06)',
        'btn': '0 5px 15px rgb(0 0 0 / 30%)',
        'tag': '0 2px 6px rgba(0,0,0,.08)',
      },
      transitionDuration: {
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
