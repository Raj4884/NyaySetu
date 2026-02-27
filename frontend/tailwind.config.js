/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#b49258", // Gold accent
                "navy-deep": "#1a2a44", // Formal Navy
                "cream": "#fdfbf7", // Classic formal background
                "background-light": "#f8f6f6",
                "background-dark": "#221610",
            },
            fontFamily: {
                "display": ["Public Sans", "sans-serif"],
                "serif": ["Playfair Display", "serif"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
        },
    },
    plugins: [],
}
