import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "circuit-pulse": {
          "0%, 100%": { opacity: "1", strokeWidth: "2" },
          "50%": { opacity: "0.6", strokeWidth: "1.5" }
        },
        "circuit-flow": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" }
        },
        "dot-fade": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" }
        },
        "morph": {
          "0%, 100%": { d: "path('M45 35C43 40 50 42 48 48C50 50 57 50 60 45C65 37 55 30 45 35Z')" },
          "50%": { d: "path('M47 32C42 38 52 40 50 46C52 52 59 48 62 42C64 35 57 28 47 32Z')" }
        },
        "subtle-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(0.95)" }
        },
        "elegant-particle": {
          "0%": { transform: "scale(0.8) rotate(0deg)", opacity: "0.5" },
          "25%": { opacity: "1" },
          "50%": { transform: "scale(1.2) rotate(180deg)" },
          "75%": { opacity: "0.8" },
          "100%": { transform: "scale(0.8) rotate(360deg)", opacity: "0.5" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "tricolor-spin": {
          "0%": { transform: "rotate(0deg)" },
          "33%": { transform: "rotate(90deg)" },
          "66%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "circuit-pulse": "circuit-pulse 1.5s ease-in-out infinite",
        "circuit-flow": "circuit-flow 3s linear infinite",
        "circuit-dot-1": "dot-fade 2s infinite 0.1s",
        "circuit-dot-2": "dot-fade 2s infinite 0.3s",
        "circuit-dot-3": "dot-fade 2s infinite 0.5s",
        "circuit-dot-4": "dot-fade 2s infinite 0.7s",
        "circuit-dot-5": "dot-fade 2s infinite 0.9s",
        "circuit-dot-6": "dot-fade 2s infinite 1.1s",
        "circuit-dot-7": "dot-fade 2s infinite 1.3s",
        "circuit-dot-8": "dot-fade 2s infinite 1.5s",
        "morph": "morph 4s ease-in-out infinite",
        "subtle-pulse": "subtle-pulse 2s ease-in-out infinite",
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "ping-slower": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "ping-slowest": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "elegant-particle": "elegant-particle 3s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "tricolor-spin": "tricolor-spin 3s ease-in-out infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
