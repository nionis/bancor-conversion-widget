import json from "rollup-plugin-json";
import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    sourcemap: !production,
    format: "iife",
    name: "app",
    file: "public/bundle.js"
  },
  plugins: [
    json(),

    svelte({
      dev: !production,
      // Tell the compiler to output a custom element.
      customElement: false
    }),

    resolve({
      jsnext: true,
      main: true,
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
    !production && livereload("public"),

    // Minify the production build (npm run build)
    production && terser()
  ]
};
