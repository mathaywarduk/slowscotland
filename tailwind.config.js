module.exports = {
  content: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_stories/*.md',
    './*.html',
    './*.md',
  ],
  theme: {
    screens: {
      sm: "560px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        ground: "#0D0A06",
        paper: "#EAE2DC",
        "on-image": "#F3ECE6",
        ink: "#1B1611",
        muted: "#5C4A33",
        brown: "#432E10",
        button: "#905E2D",
      },
      fontFamily: {
        serif: ["Sentient", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
