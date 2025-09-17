/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
          colors: {
            primary: '#6366F1',
            primaryDark: '#4338CA',
            primaryLight: '#A5B4FC',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            sidebarBg: '#FEFEFE',
            textPrimary: '#1E293B',
            textSecondary: '#64748B',
            textMuted: '#94A3B8',
            border: '#E2E8F0',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
          },
      boxShadow: {
        subtle: '0 4px 12px rgba(0, 0, 0, 0.05)'
      },
      borderRadius: {
        xl: '12px'
      },
      spacing: {"4":"4px","8":"8px","12":"12px","16":"16px","20":"20px","24":"24px","32":"32px"},
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans]
      },
      fontSize: {
        h1: '1.875rem',
        h2: '1.5rem',
        h3: '1.25rem',
        body: '1rem',
        smbody: '0.875rem'
      }
    }
  },
  plugins: []
};

export default config;
