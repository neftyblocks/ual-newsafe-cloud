import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import common from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.cjs",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.mjs",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [typescript()],
    external: [/univeral-authenticator-library\/*/, "ohmyfetch"],
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/dist.min.js",
        format: "umd",
        sourcemap: true,
        name: "ualNewsafeCloud",
      },
    ],
    plugins: [resolve(), typescript(), common(), terser()],
  },
];
