import json from "rollup-plugin-json";
import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import bundleVisualizer from "rollup-plugin-visualizer";
import bundleSize from "rollup-plugin-bundle-size";
import pkg from "./package.json";

const production = !process.env.ROLLUP_WATCH;

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, "$3")
  .replace(/^\w/, m => m.toUpperCase())
  .replace(/-\w/g, m => m[1].toUpperCase());

export default {
  input: "src/index.svelte",
  output: [
    {
      sourcemap: !production,
      format: "iife",
      name,
      file: "example/bundle.js"
    }
  ].concat(
    production
      ? [
          { file: pkg.module, format: "es" },
          { file: pkg.main, format: "umd", name }
        ]
      : []
  ),
  plugins: [
    json(),

    svelte({
      dev: !production,
      customElement: false // TODO: gotta try this once react supports custom components fully
    }),

    resolve({
      mainFields: ["jsnext", "main"],
      browser: true,
      preferBuiltins: true,
      dedupe: importee =>
        importee === "svelte" || importee.startsWith("svelte/")
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    commonjs(),
    builtins(),
    globals(),

    // Enable live reloading in development mode
    !production && livereload("example"),

    // Minify the production build (npm run build)
    production && terser(),

    // Generate bundle statistics
    production &&
      bundleVisualizer({
        filename: "./dist/stats.html",
        template: "treemap"
      }),

    // Print bundle size
    production && bundleSize()
  ]
};
