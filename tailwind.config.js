/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1C1917', // Dark
                    foreground: '#FAFAF9',
                },
                secondary: {
                    DEFAULT: '#44403C',
                    foreground: '#FAFAF9',
                },
                accent: {
                    DEFAULT: '#CA8A04', // Gold
                    foreground: '#FAFAF9',
                },
                background: '#0C0A09', // Dark background override for "Premium Dark" feel
                surface: '#1C1917', // Slightly lighter dark for cards
                muted: '#A8A29E',
                border: 'rgba(255, 255, 255, 0.1)',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            boxShadow: {
                'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'glass-md': '0 8px 30px rgba(0, 0, 0, 0.12)',
                'glass-lg': '0 30px 60px rgba(0, 0, 0, 0.12)',
                'glow': '0 0 20px rgba(202, 138, 4, 0.15)', // Gold glow
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #1C1917 0deg, #292524 180deg, #1C1917 360deg)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
