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

// @vagaro/vagaro-react-toolkit imports react-filerobot-image-editor, which
// isn't installed (the chat widget never renders the image editor). Stub it
// so the browser isn't asked to resolve a bare import at runtime.
const stubFilerobotImageEditor = {
  name: "stub-filerobot-image-editor",
  resolveId(source) {
    return source === "react-filerobot-image-editor"
      ? "\0stub:react-filerobot-image-editor"
      : null;
  },
  load(id) {
    if (id === "\0stub:react-filerobot-image-editor") {
      return `export default function FilerobotImageEditorStub() { return null; }
export const TOOLS = {};
export const TABS = {};`;
    }
    return null;
  },
};
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
      if (
        warning.code === "MODULE_LEVEL_DIRECTIVE" &&
        warning.message.includes('"use client"')
      ) {
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
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV || "development"
        ),
      }),
      babel({
        babelHelpers: "bundled",
        extensions: [".js", ".jsx"],
        exclude: "node_modules/**",
        presets: [["@babel/preset-react", { runtime: "classic" }]],
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
    onwarn: (warning, warn) => {
      // Suppress "use client" directive warnings from Radix UI
      if (
        warning.code === "MODULE_LEVEL_DIRECTIVE" &&
        warning.message.includes('"use client"')
      ) {
        return;
      }
      // Use default warning handler for other warnings
      warn(warning);
    },
    input: {
      "new-request-form": "src/modules/new-request-form/index.tsx",
      "flash-notifications": "src/modules/flash-notifications/index.ts",
      "category-accordions":
        "src/modules/category-accordions/categoryAccordionsBundle.js",
      "article-accordions":
        "src/modules/article-accordions/articleAccordionsBundle.ts",
      "mobile-cta-banner": "src/modules/mobileCtaBannerIntegration.js",
      "vera-chat": "src/modules/vera-chat/index.tsx",
    },
    output: {
      dir: "assets",
      format: "es",
      manualChunks: (id) => {
        // Exclude WYSIWYG from bundling - make it external
        if (
          id.includes("node_modules/@zendesk/help-center-wysiwyg") ||
          id.includes("node_modules/@ckeditor5")
        ) {
          return undefined; // Don't bundle, make external
        }

        // Bundle Garden components to avoid module resolution issues
        // Note: These were previously external but caused module resolution errors
        // when not available via CDN

        // Vera chat's heavy deps (signalr, vagaro toolkit) stay out of the
        // site-wide shared bundle; they load only with the vera-chat module.
        if (
          id.includes("node_modules/vera-chat-widget") ||
          id.includes("node_modules/@microsoft/signalr") ||
          id.includes("node_modules/@vagaro/vagaro-react-toolkit") ||
          id.includes("node_modules/idb")
        ) {
          return "vera-vendor";
        }

        if (id.includes("node_modules") || id.includes("src/modules/shared")) {
          return "shared";
        }

        // Bundle only English translation files from `src/modules/MODULE_NAME/translations/locales/*.json to `${MODULE_NAME}-translations.js`
        const translationFileMatch = id.match(TRANSLATION_FILE_REGEX);
        if (translationFileMatch) {
          // Only include English locales to reduce bundle size
          if (
            id.includes("/en-us.json") ||
            id.includes("/en-gb.json") ||
            id.includes("/en-ca.json")
          ) {
            return `${translationFileMatch[1]}-translations`;
          }
          // Exclude non-English translations from bundling
          return undefined;
        }
      },
      entryFileNames: fileNames,
      chunkFileNames: fileNames,
    },
    external: [
      "@zendesk/help-center-wysiwyg",
      // Garden components are now bundled instead of external to avoid module resolution issues
      "@zendeskgarden/svg-icons",
    ],
    plugins: [
      stubFilerobotImageEditor,
      nodeResolve({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        preferBuiltins: false,
        browser: true,
      }),
      babel({
        babelHelpers: "bundled",
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        exclude: "node_modules/**",
        presets: [["@babel/preset-react", { runtime: "classic" }]],
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
      isProduction &&
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: [
              "console.log",
              "console.info",
              "console.debug",
              "console.warn",
            ],
          },
          mangle: {
            safari10: true,
          },
        }),
      generateImportMap(),
    ],
    watch: {
      clearScreen: false,
    },
  },
]);
