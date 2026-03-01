import terser from "@rollup/plugin-terser";

export default {
  input: "src/upgradekit.js",
  output: {
    file: "dist/upgradekit.js",
    format: "iife",
    name: "UpgradeKit",
  },
  plugins: [
    terser({
      compress: { passes: 2 },
      format: { comments: false },
    }),
  ],
};
