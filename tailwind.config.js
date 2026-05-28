/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0a0a0f', secondary: '#111118', card: '#16161f', border: '#1e1e2e' },
        accent: { cyan: '#00d4ff', cyan_dim: '#00d4ff22', cyan_hover: '#00bfea' },
        text: { primary: '#e8e8f0', secondary: '#8888aa', muted: '#44445a' },
        status: { aberto: '#00d4ff', em_andamento: '#f59e0b', finalizado: '#22c55e' },
        role: { admin: '#f43f5e', tecnico: '#a78bfa', usuario: '#00d4ff' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        cyan: '0 0 20px #00d4ff18',
        'cyan-md': '0 0 40px #00d4ff22',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        pulse_slow: 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
