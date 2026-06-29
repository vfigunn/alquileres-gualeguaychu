import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#000000",
        "tertiary-fixed": "#d3e4fe",
        "secondary-container": "#fed488",
        "on-tertiary-container": "#75859d",
        "on-tertiary-fixed": "#0b1c30",
        "inverse-on-surface": "#eff1f3",
        "primary-container": "#131b2e",
        "inverse-surface": "#2d3133",
        "surface-container-highest": "#e0e3e5",
        "on-secondary": "#ffffff",
        "on-secondary-fixed-variant": "#5d4201",
        "surface-container": "#eceef0",
        "surface-tint": "#565e74",
        "outline": "#76777d",
        "secondary-fixed": "#ffdea5",
        "primary-fixed": "#dae2fd",
        "on-primary-fixed-variant": "#3f465c",
        "error-container": "#ffdad6",
        "on-tertiary-fixed-variant": "#38485d",
        "surface-dim": "#d8dadc",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#c6c6cd",
        "surface-variant": "#e0e3e5",
        "primary-fixed-dim": "#bec6e0",
        "on-secondary-container": "#785a1a",
        "on-primary": "#ffffff",
        "tertiary": "#000000",
        "on-error": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "on-error-container": "#93000a",
        "on-background": "#191c1e",
        "on-surface-variant": "#45464d",
        "secondary": "#775a19",
        "tertiary-container": "#0b1c30",
        "surface-container-high": "#e6e8ea",
        "surface-bright": "#f7f9fb",
        "on-tertiary": "#ffffff",
        "background": "#f7f9fb",
        "inverse-primary": "#bec6e0",
        "on-primary-container": "#7c839b",
        "on-surface": "#191c1e",
        "tertiary-fixed-dim": "#b7c8e1",
        "on-primary-fixed": "#131b2e",
        "surface": "#f7f9fb",
        "error": "#ba1a1a",
        "secondary-fixed-dim": "#e9c176",
        "on-secondary-fixed": "#261900",
        "gold": "#D4AF37",
        "gold-dark": "#B8960F"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "gutter": "24px",
        "base": "4px",
        "xs": "8px",
        "xl": "80px",
        "md": "24px",
        "sm": "16px",
        "lg": "48px",
        "container-max": "1280px"
      },
      fontFamily: {
        "body-md": ["Manrope", "sans-serif"],
        "label-md": ["Manrope", "sans-serif"],
        "headline-lg-mobile": ["EB Garamond", "serif"],
        "headline-lg": ["EB Garamond", "serif"],
        "headline-md": ["EB Garamond", "serif"],
        "body-lg": ["Manrope", "sans-serif"],
        "display-lg": ["EB Garamond", "serif"],
        "label-sm": ["Manrope", "sans-serif"]
      },
      fontSize: {
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "headline-lg-mobile": ["28px", {"lineHeight": "36px", "fontWeight": "500"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "500"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "500"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
        "label-sm": ["12px", {"lineHeight": "16px", "fontWeight": "500"}]
      }
    },
  },
  plugins: [],
};

export default config;
