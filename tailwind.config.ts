import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        body: ["Raleway", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        divine: {
          gold: "hsl(var(--divine-gold))",
          "gold-light": "hsl(var(--divine-gold-light))",
          white: "hsl(var(--divine-white))",
          celestial: "hsl(var(--celestial-blue))",
          glow: "hsl(var(--sacred-glow))",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-30px) rotate(5deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 30px hsl(43 85% 70% / 0.5), 0 10px 40px hsl(43 85% 70% / 0.3)",
            transform: "scale(1)"
          },
          "50%": { 
            boxShadow: "0 0 50px hsl(43 85% 70% / 0.8), 0 20px 60px hsl(43 85% 70% / 0.5)",
            transform: "scale(1.02)"
          },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.8" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        "sparkle-cluster": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "particle-float": {
          "0%, 100%": { 
            transform: "translateY(0) translateX(0) scale(1)",
            opacity: "0.6"
          },
          "25%": { 
            transform: "translateY(-50px) translateX(20px) scale(1.2)",
            opacity: "1"
          },
          "50%": { 
            transform: "translateY(-100px) translateX(-10px) scale(0.8)",
            opacity: "0.8"
          },
          "75%": { 
            transform: "translateY(-50px) translateX(-30px) scale(1.1)",
            opacity: "0.9"
          },
        },
        "glow-pulse": {
          "0%, 100%": { 
            textShadow: "0 0 20px hsl(43 85% 70% / 0.8), 0 0 40px hsl(43 85% 70% / 0.4)"
          },
          "50%": { 
            textShadow: "0 0 30px hsl(43 85% 70% / 1), 0 0 60px hsl(43 85% 70% / 0.6)"
          },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        pulse: "pulse 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 6s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
        twinkle: "twinkle 2s ease-in-out infinite",
        "sparkle-cluster": "sparkle-cluster 4s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "fade-in": "fade-in 1s ease-out forwards",
        "particle-float": "particle-float 10s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "rotate-slow": "rotate-slow 60s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
