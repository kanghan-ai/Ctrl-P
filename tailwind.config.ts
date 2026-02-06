import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'minimal-gray': '#F5F5F5',
                'minimal-accent': '#262626',
                'soft-border': '#E5E5E5',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'soft': '0 8px 30px rgba(0,0,0,0.04)',
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
                '3xl': '24px',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                serif: ['var(--font-lora)', 'Songti SC', 'Noto Serif SC', 'serif'],
                rounded: ['var(--font-comfortaa)', 'system-ui', 'sans-serif'], // Update rounded to Comfortaa
            },
        },
    },
    plugins: [],
};

export default config;
