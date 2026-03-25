/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

    theme: {
        extend: {
            colors: {
                'vigil-bg': '#04060f',
                'vigil-surface': '#0a0f1e',
                'vigil-border': 'rgba(255,255,255,0.06)',
                'vigil-text': '#f0f4ff',
                'vigil-muted': '#94a3b8',
                'vigil-accent': '#38bdf8',
                'vigil-cyan': '#22d3ee',
                'vigil-emerald': '#34d399',
                'vigil-violet': '#a78bfa',
                'vigil-rose': '#fb7185',
                'vigil-amber': '#fbbf24',
            },

            fontFamily: {
                ui: ['DM Sans', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },

            borderRadius: {
                xs: '0.25rem',
                sm: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                '2xl': '1.5rem',
            },
        },
    },

    darkMode: 'selector',

    plugins: [],
};
