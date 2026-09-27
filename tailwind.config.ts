import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { brand: { DEFAULT: '#FFC107', hover: '#FFB300', light: '#FFF8E1' }, ink: '#1A1A1A', muted: '#6B7280', success: '#22C55E', danger: '#EF4444', warning: '#F59E0B' }, boxShadow: { card: '0 6px 24px rgba(26,26,26,.07)' } } },
  plugins: [],
};
export default config;
