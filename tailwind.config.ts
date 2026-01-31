import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'longhorn-navy': '#002a4d',
        'longhorn-blue': '#0062ab',
        'longhorn-orange': '#f39200',
      },
    },
  },
  plugins: [],
}
export default config
