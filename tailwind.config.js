/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Rider theme - Teal primary
        primary: "#1B9B8E",
        primaryDark: "#0A8F83",
        primaryLight: "#10A89B",

        // Accent color - Yellow/lime
        secondary: "#F7DC6F",
        accent: "#C4FF4B",

        // Status colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",

        // Order status colors
        statusPending: "#F59E0B",       // Orange
        statusAssigned: "#3B82F6",      // Blue
        statusEnRoute: "#8B5CF6",       // Purple
        statusArrived: "#06B6D4",       // Cyan
        statusCompleted: "#10B981",     // Green
        statusCancelled: "#EF4444",     // Red

        // Neutral colors
        background: "#F9FAFB",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        textMuted: "#9CA3AF",
      },
      fontFamily: {
        // System fonts
      },
    },
  },
  plugins: [],
};
