/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'mental-health-banner': "url('src/assets/mental_health_banner.jpg')",
      },
    },
  },
  plugins: [],
};
