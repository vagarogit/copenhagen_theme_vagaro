/* eslint-env node */
import zass from "./zass.mjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import svgr from "@svgr/rollup";
import { generateImportMap } from "./generate-import-map.mjs";
import { defineConfig } from "rollup";

const fileNames = "[name]-bundle.js";
const isProduction = process.env.NODE_ENV === "production";
const TRANSLATION_FILE_REGEX =
  /src\/modules\/(.+?)\/translations\/locales\/.+?\.json$/;

export default defineConfig([
  // Configuration for bundling the script.js file
  {
    input: "src/index.js",
    output: {
      file: "script.js",
      format: "iife",
    },
    onwarn: (warning, warn) => {
      // Suppress "use client" directive warnings from Radix UI
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('"use client"')) {
        return;
      }
      // Use default warning handler for other warnings
      warn(warning);
    },
    plugins: [
      zass(),
      nodeResolve({
        extensions: [".js", ".jsx"],
      }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
      }),
      babel({
        babelHelpers: "bundled",
        extensions: [".js", ".jsx"],
        exclude: "node_modules/**",
        presets: [
          ["@babel/preset-react", { runtime: "classic" }]
        ],
      }),
      commonjs(),
      isProduction && terser(),
    ].filter(Boolean),
    watch: {
      clearScreen: false,
    },
  },
  // Configuration for bundling modules in the src/modules directory
  {
    context: "this",
    input: {
      "new-request-form": "src/modules/new-request-form/index.tsx",
      "flash-notifications": "src/modules/flash-notifications/index.ts",
      "category-accordions": "src/modules/category-accordions/categoryAccordionsBundle.ts",
    },
    output: {
      dir: "assets",
      format: "es",
      manualChunks: (id) => {
        if (
          id.includes("node_modules/@zendesk/help-center-wysiwyg") ||
          id.includes("node_modules/@ckeditor5")
        ) {
          return "wysiwyg";
        }

        if (id.includes("node_modules") || id.includes("src/modules/shared")) {
          return "shared";
        }

        // Bundle all files from `src/modules/MODULE_NAME/translations/locales/*.json to `${MODULE_NAME}-translations.js`
        const translationFileMatch = id.match(TRANSLATION_FILE_REGEX);
        if (translationFileMatch) {
          return `${translationFileMatch[1]}-translations`;
        }
      },
      entryFileNames: fileNames,
      chunkFileNames: fileNames,
    },
    plugins: [
      nodeResolve({
        extensions: [".js"],
      }),
      commonjs(),
      typescript(),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": '"production"',
      }),
      svgr({
        svgo: true,
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeTitle: false,
                  convertPathData: false,
                  removeViewBox: false,
                },
              },
            },
          ],
        },
      }),
      json(),
      dynamicImportVars(),
      isProduction && terser(),
      generateImportMap(),
    ],
    watch: {
      clearScreen: false,
    },
  },
]);
