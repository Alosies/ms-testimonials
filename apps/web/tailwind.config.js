/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    '../../packages/libs/ui/src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
  	extend: {
  		// Custom animations for AI/glassmorphic effects
  		animation: {
  			'aurora': 'aurora 4s ease-in-out infinite',
  			'blob': 'blob 10s ease-in-out infinite',
  			'float-orb': 'float-orb 8s ease-in-out infinite',
  			'shimmer-glass': 'shimmer-glass 2.5s ease-in-out infinite',
  			'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
  			'ping-slower': 'ping-slower 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
  			'spin-slow': 'spin 8s linear infinite',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  			'sparkle': 'sparkle 2s ease-in-out infinite',
  			'blink': 'blink 0.8s step-end infinite',
  		},
  		keyframes: {
  			aurora: {
  				'0%, 100%': { transform: 'translateX(-100%) skewX(-15deg)', opacity: '0' },
  				'50%': { transform: 'translateX(100%) skewX(-15deg)', opacity: '0.5' },
  			},
  			blob: {
  				'0%, 100%': { transform: 'translate(0, 0) scale(1)' },
  				'25%': { transform: 'translate(20px, -30px) scale(1.1)' },
  				'50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
  				'75%': { transform: 'translate(30px, 10px) scale(1.05)' },
  			},
  			'float-orb': {
  				'0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
  				'25%': { transform: 'translate(30px, -40px) scale(1.2)', opacity: '0.5' },
  				'50%': { transform: 'translate(-20px, 30px) scale(0.8)', opacity: '0.4' },
  				'75%': { transform: 'translate(40px, 20px) scale(1.1)', opacity: '0.5' },
  			},
  			'shimmer-glass': {
  				'0%': { backgroundPosition: '200% 0', opacity: '0.2' },
  				'50%': { opacity: '0.4' },
  				'100%': { backgroundPosition: '-200% 0', opacity: '0.2' },
  			},
  			'ping-slow': {
  				'0%': { transform: 'scale(1)', opacity: '0.6' },
  				'75%, 100%': { transform: 'scale(1.6)', opacity: '0' },
  			},
  			'ping-slower': {
  				'0%': { transform: 'scale(1)', opacity: '0.4' },
  				'75%, 100%': { transform: 'scale(2)', opacity: '0' },
  			},
  			'pulse-glow': {
  				'0%, 100%': { boxShadow: '0 0 10px 2px rgba(255,255,255,0.5)' },
  				'50%': { boxShadow: '0 0 20px 4px rgba(255,255,255,0.8)' },
  			},
  			sparkle: {
  				'0%, 100%': { opacity: '0', transform: 'scale(0)' },
  				'50%': { opacity: '1', transform: 'scale(1)' },
  			},
  			blink: {
  				'0%, 50%': { opacity: '1' },
  				'51%, 100%': { opacity: '0' },
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
