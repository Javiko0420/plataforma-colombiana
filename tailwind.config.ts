import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx,mdx}',
    './src/lib/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border, #e5e7eb)',
        input: 'var(--input, #e5e7eb)',
        ring: 'var(--ring, #2563eb)',
        accent: {
          DEFAULT: 'var(--accent, #f4f4f5)',
          foreground: 'var(--accent-foreground, #111827)',
        },
      },
    },
  },
  plugins: [],
}

export default config


