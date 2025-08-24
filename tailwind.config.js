/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--background))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--foreground))",
        },
        // Brand color scales for direct use
        church: {
          burgundy: {
            50: "#fdf2f3",
            100: "#fce7e8",
            200: "#f9d3d6",
            300: "#f4b1b6",
            400: "#ec8691",
            500: "#e0596b",
            600: "#cc3f56",
            700: "#ab2e46",
            800: "#800020", // Primary Burgundy
            900: "#661a1c",
            950: "#4d1316",
          },
          bronze: {
            50: "#faf8f0",
            100: "#f4f0e1",
            200: "#e8e0c3",
            300: "#dbcd9f",
            400: "#d1be8a",
            500: "#CD7F32", // Primary Bronze
            600: "#b8722d",
            700: "#9a5f26",
            800: "#7f4f22",
            900: "#68411e",
            950: "#4a2e15",
          },
          olive: {
            50: "#f8f9f4",
            100: "#f1f4e8",
            200: "#e2e8d1",
            300: "#cdd7b4",
            400: "#b4c492",
            500: "#9bb06f",
            600: "#7e9354",
            700: "#6b7e44",
            800: "#556B2F", // Secondary Olive
            900: "#485a29",
            950: "#253123",
          },
          slate: {
            50: "#f3f3ff",
            100: "#ebeafe",
            200: "#d9d8fe",
            300: "#beb9fd",
            400: "#9d93fa",
            500: "#7b6af6",
            600: "#6A5ACD", // Secondary Slate Blue
            700: "#5b4bb8",
            800: "#4c3e96",
            900: "#3f3778",
            950: "#262046",
          }
        }
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
