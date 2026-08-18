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
import postcss from "rollup-plugin-postcss";
import fs from "fs";
import path from "path";
import { generateImportMap } from "./generate-import-map.mjs";
import { defineConfig } from "rollup";

const fileNames = "[name]-bundle.js";
const isProduction = process.env.NODE_ENV === "production";

// Toolkit stylesheets are side-effectful imports, so rollup keeps every one of
// them even when tree-shaking drops the component's JS — 863KB of CSS for five
// components we actually render. Work out which stylesheets the chat path can
// reach and drop the rest.
//
// The reachable set is derived from the widget's own imports rather than
// hardcoded, so upgrading vera-chat-widget picks up any component it starts
// using. Walks: widget entry -> named toolkit imports -> those components'
// relative import graph -> the .css each file pulls in.
const TOOLKIT_DIR = "node_modules/@vagaro/vagaro-react-toolkit";
const WIDGET_ENTRY = "node_modules/vera-chat-widget/dist/index.js";
const TOOLKIT_COMPONENTS = `${TOOLKIT_DIR}/dist/components`;

function reachableToolkitStylesheets() {
  const entry = path.resolve(WIDGET_ENTRY);
  if (!fs.existsSync(entry)) return null; // toolkit/widget not installed yet

  const used = new Set();
  const widget = fs.readFileSync(entry, "utf8");
  const importRe =
    /import\s*\{([^}]*)\}\s*from\s*["']@vagaro\/vagaro-react-toolkit["']/g;
  for (const m of widget.matchAll(importRe)) {
    for (const spec of m[1].split(",")) {
      const name = spec.trim().split(/\s+as\s+/)[0];
      if (name) used.add(name);
    }
  }

  const css = new Set();
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file) || !fs.existsSync(file)) return;
    seen.add(file);
    const source = fs.readFileSync(file, "utf8");
    for (const m of source.matchAll(/(?:from|import)\s*["'](\.[^"']+)["']/g)) {
      const target = path.resolve(path.dirname(file), m[1]);
      if (m[1].endsWith(".css")) {
        css.add(target);
        continue;
      }
      for (const candidate of [target, `${target}.js`, `${target}/index.js`]) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          visit(candidate);
          break;
        }
      }
    }
  };
  for (const name of used) {
    visit(path.resolve(`${TOOLKIT_COMPONENTS}/${name}/${name}.js`));
  }
  return css.size ? css : null;
}

const keptStylesheets = reachableToolkitStylesheets();
const droppedStylesheets = new Set();
const CSS_SKIP_PREFIX = "\0toolkit-css-skip:";

const dropUnreachableToolkitCss = {
  name: "drop-unreachable-toolkit-css",
  resolveId(source, importer) {
    if (!keptStylesheets || !source.endsWith(".css") || !importer) return null;
    if (!importer.includes(TOOLKIT_DIR)) return null;
    // Only the toolkit's own co-located stylesheets. A bare specifier
    // (swiper/swiper-bundle.css) belongs to a real package — leave it to
    // node resolution rather than resolving it as though it were relative.
    if (!source.startsWith(".")) return null;
    const resolved = path.resolve(path.dirname(importer), source);
    if (keptStylesheets.has(resolved)) return null;
    droppedStylesheets.add(path.relative(TOOLKIT_DIR, resolved));
    // Deliberately not a .css id, so rollup-plugin-postcss ignores it.
    return `${CSS_SKIP_PREFIX}${resolved}`;
  },
  load(id) {
    return id.startsWith(CSS_SKIP_PREFIX) ? "export default undefined;" : null;
  },
  buildEnd() {
    if (!keptStylesheets) {
      this.warn(
        "toolkit stylesheet allowlist could not be built — shipping all toolkit CSS"
      );
    } else if (droppedStylesheets.size) {
      console.log(
        `\nKept ${keptStylesheets.size} toolkit stylesheet(s) for the chat path, ` +
          `dropped ${droppedStylesheets.size} unreachable one(s).\n`
      );
    }
  },
};

// @vagaro/vagaro-react-toolkit 4.x declares 44 peer dependencies and its entry
// point is a barrel that re-exports every Vg* component. The chat widget uses
// five of them, but rollup still walks the whole barrel, so it meets imports
// for libraries this theme has no reason to install (video.js, react-select,
// jspdf...). Left unresolved they stay in the output as bare specifiers the
// browser cannot load, because rollup must assume an external module has side
// effects. Resolving them to an inert stub instead lets tree-shaking drop the
// unused components — and the imports — entirely.
//
// Only imports originating inside the toolkit are stubbed, so a genuinely
// missing dependency of our own code still fails the build. The stub's default
// export is a Proxy and `syntheticNamedExports` maps every named import onto
// it, so any import shape resolves without a missing-export warning.
const STUB_PREFIX = "\0toolkit-stub:";
const STUB_CODE = `const stub = new Proxy(function stubbed() { return null; }, {
  get: (target, prop) => (prop === "__esModule" ? true : stub),
});
export default stub;`;

const stubUnusedToolkitPeers = {
  name: "stub-unused-toolkit-peers",
  async resolveId(source, importer) {
    if (!importer || !importer.includes(TOOLKIT_DIR)) return null;
    if (source.startsWith(".") || source.startsWith("\0")) return null;
    const resolved = await this.resolve(source, importer, { skipSelf: true });
    if (resolved) return null;
    stubbedPeers.add(source);
    return `${STUB_PREFIX}${source}`;
  },
  load(id) {
    return id.startsWith(STUB_PREFIX)
      ? { code: STUB_CODE, syntheticNamedExports: "default" }
      : null;
  },
  buildEnd() {
    if (stubbedPeers.size) {
      // Surface what was replaced: a peer the chat path actually needs would
      // otherwise be stubbed silently and only fail in the browser.
      console.log(
        `\nStubbed ${stubbedPeers.size} uninstalled toolkit peer(s): ` +
          `${[...stubbedPeers].sort().join(", ")}\n`
      );
    }
  },
};
const stubbedPeers = new Set();
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
      // Cycles inside the prebuilt toolkit dist are parent/child component
      // pairs resolved at render time, not module evaluation — benign, and not
      // ours to fix. Cycles in our own src/ still warn.
      if (
        warning.code === "CIRCULAR_DEPENDENCY" &&
        warning.message.includes("node_modules")
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
        // Toolkit stubs reached through a dynamic import (VgTables' export
        // libs) would otherwise each become their own chunk and get an entry
        // in the theme's import map.
        if (
          id.startsWith(STUB_PREFIX) ||
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
      stubUnusedToolkitPeers,
      // Must precede postcss so skipped stylesheets never reach it.
      dropUnreachableToolkitCss,
      // Toolkit 4.x ships its component styles as plain .css next to each
      // component (3.x inlined them via style-inject). Inject them at runtime
      // so the chat box is styled without the theme having to load an extra
      // stylesheet for a module that itself loads on demand.
      postcss({
        include: "**/*.css",
        inject: true,
        minimize: isProduction,
      }),
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
