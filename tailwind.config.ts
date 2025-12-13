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
        cinzel: ["Cinzel", "serif"],
        playfair: ["Playfair Display", "serif"],
        divine: ["Cinzel", "Cormorant Garamond", "serif"],
        lora: ["Lora", "serif"],
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
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
        healing: {
          green: "hsl(var(--healing-green))",
          "green-light": "hsl(var(--healing-green-light))",
          mint: "hsl(var(--healing-mint))",
          teal: "hsl(var(--healing-teal))",
          sky: "hsl(var(--healing-sky))",
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
        "title-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shooting-star": {
          "0%": { 
            transform: "translateX(0) translateY(0)",
            opacity: "1"
          },
          "70%": { 
            opacity: "1"
          },
          "100%": { 
            transform: "translateX(300px) translateY(300px)",
            opacity: "0"
          },
        },
        "divine-glow": {
          "0%, 100%": { 
            textShadow: "0 0 30px #FFD700, 0 0 60px #FFFFFF, 0 0 90px #FFD700",
            filter: "brightness(1)"
          },
          "50%": { 
            textShadow: "0 0 40px #FFD700, 0 0 80px #FFFFFF, 0 0 120px #FFD700",
            filter: "brightness(1.1)"
          },
        },
        "tagline-gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "sparkle-1": {
          "0%, 100%": { 
            opacity: "0",
            transform: "translateY(0) scale(0)"
          },
          "50%": { 
            opacity: "1",
            transform: "translateY(-8px) scale(1.2)"
          },
        },
        "sparkle-2": {
          "0%, 100%": { 
            opacity: "0",
            transform: "translateX(0) scale(0)"
          },
          "50%": { 
            opacity: "1",
            transform: "translateX(8px) scale(1.5)"
          },
        },
        "sparkle-3": {
          "0%, 100%": { 
            opacity: "0",
            transform: "translate(0, 0) scale(0)"
          },
          "50%": { 
            opacity: "1",
            transform: "translate(-6px, -6px) scale(1)"
          },
        },
        "icon-glow": {
          "0%, 100%": { 
            opacity: "0.7",
            transform: "scale(1)"
          },
          "50%": { 
            opacity: "1",
            transform: "scale(1.1)"
          },
        },
        "icon-shimmer": {
          "0%, 100%": { 
            filter: "brightness(1) drop-shadow(0 0 8px currentColor)"
          },
          "50%": { 
            filter: "brightness(1.3) drop-shadow(0 0 12px currentColor)"
          },
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
        "title-shimmer": "title-shimmer 3s ease-in-out infinite",
        "title-glow": "title-shimmer 3s ease-in-out infinite, glow-pulse 2s ease-in-out infinite",
        "rotate-slow": "rotate-slow 60s linear infinite",
        "shooting-star": "shooting-star 2s ease-out forwards",
        "divine-glow": "divine-glow 4s ease-in-out infinite",
        "tagline-gradient": "tagline-gradient 8s ease-in-out infinite",
        "sparkle-1": "sparkle-1 2s ease-in-out infinite",
        "sparkle-2": "sparkle-2 2.5s ease-in-out infinite",
        "sparkle-3": "sparkle-3 3s ease-in-out infinite",
        "icon-glow": "icon-glow 3s ease-in-out infinite",
        "icon-shimmer": "icon-shimmer 2s ease-in-out infinite",
        "particle-rise": "particle-rise linear infinite",
        "sacred-glow": "sacred-glow 6s ease-in-out infinite",
      },
      keyframes: {
        "particle-rise": {
          "0%": {
            transform: "translateY(0) translateX(0) scale(1)",
            opacity: "0",
          },
          "10%": {
            opacity: "1",
          },
          "90%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-100vh) translateX(20px) scale(0.5)",
            opacity: "0",
          },
        },
        "sacred-glow": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 25px rgba(135, 206, 235, 0.8))",
          },
          "50%": {
            filter: "drop-shadow(0 0 40px rgba(135, 206, 235, 1)) drop-shadow(0 0 60px rgba(224, 248, 255, 0.6))",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
