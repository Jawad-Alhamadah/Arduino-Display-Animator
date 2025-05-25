/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          primary:"#fef08a",
          secondary:"#eab308",
          primaryBG:"#fefce8",
          accent:"#ca8a04"

        },
        


    },
  },
  plugins: [],
}
