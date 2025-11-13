// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Ensure you've imported 'Press Start 2P' in your index.css
        'pixel': ['"Press Start 2P"', 'cursive'], 
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'], // Keep a fallback if needed
      },
      colors: {
        // Our new theme colors
        'pixel-purple': '#9333ea', // A good vibrant purple
        'pixel-purple-dark': '#7e22ce', // Darker shade for hover
        'pixel-gray-light': '#a7a7a7', // Light gray text
        'pixel-card-bg': '#1e293b', // Dark slate for cards (e.g., bg-slate-800)
        'pixel-border': '#64748b', // A border color for dark themes
      },
      boxShadow: {
        // Custom pixelated shadow
        'pixel-box': '4px 4px 0px 0px rgba(0, 0, 0, 0.75)',
        'pixel-button': '3px 3px 0px 0px rgba(0, 0, 0, 0.75)',
        'pixel-button-hover': '1px 1px 0px 0px rgba(0, 0, 0, 0.75)', // Smaller on hover for "pressed"
      },
      // You can also adjust default sizes if the pixel font is consistently small
      // fontSize: {
      //   'xs': '.75rem',
      //   'sm': '.875rem',
      //   'base': '1rem',
      //   'lg': '1.125rem',
      //   'xl': '1.25rem',
      //   '2xl': '1.5rem',
      //   '3xl': '1.875rem',
      //   '4xl': '2.25rem',
      // },
    },
  },
  plugins: [],
}