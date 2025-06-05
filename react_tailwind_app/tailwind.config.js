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
          accent:"#ca8a04",

          cardOutline: "var(--color-cardOutline)",
          accentText:"var(--color-accentText)",
          iconColor:"var(--color-Icon)",
          iconColorHover:("var(--color-IconHover)")

          

        },
        screens:{
           'max-500': { 'max': '550px' },
           'max-750': { 'max': '750px' }
        }
        


    },
  },
  plugins: [],
}
