import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-secondary': 'var(--color-surface-secondary)',
        'surface-tertiary': 'var(--color-surface-tertiary)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'text-dark': 'var(--color-text-dark)',
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        success: 'var(--color-success)',
        'success-dark': 'var(--color-success-dark)',
        'success-light': 'var(--color-success-light)',
        'success-lightest': 'var(--color-success-lightest)',
        'success-foreground': 'var(--color-success-foreground)',
        info: 'var(--color-info)',
        'info-light': 'var(--color-info-light)',
        'info-lightest': 'var(--color-info-lightest)',
        warning: 'var(--color-warning)',
        'warning-foreground': 'var(--color-warning-foreground)',
        'warning-light': 'var(--color-warning-light)',
        'warning-lightest': 'var(--color-warning-lightest)',
        error: 'var(--color-error)',
        'error-light': 'var(--color-error-light)',
        'error-foreground': 'var(--color-error-foreground)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
