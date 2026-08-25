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

// The toolkit ships dist/tailwind-inject.js: its whole Tailwind utility set as
// an 85KB string appended to <head> as a plain <style> at import time,
// deliberately "so they cascade after consumer <link> stylesheets (v3 parity)".
// Because that <style> is unlayered and every utility in assets/output.css sits
// in @layer utilities, the toolkit's copy outranks ours unconditionally — an
// unlayered rule beats a layered one regardless of order or specificity. The
// toolkit only ships unprefixed utilities, so a base class it happens to share
// with a template (grid-cols-2, px-2, hidden, gap-6...) sticks at its base
// value and our md:/lg:/xl: overrides can never win. That pinned the home page
// category grid and the footer link grid to two columns at every viewport.
//
// Wrap the injected sheet in @layer vg-toolkit instead. styles/input.css
// declares that layer before @import "tailwindcss", so it is the first layer
// declared and therefore the lowest priority — the theme's own utilities win,
// while the widget still gets every utility it needs. Keep the two in sync:
// without the declaration in input.css this layer would be created here, last,
// and would outrank @layer utilities exactly as the unlayered version did.
const TOOLKIT_TAILWIND_INJECT = path.join("dist", "tailwind-inject.js");
const TOOLKIT_LAYER = "vg-toolkit";
let layeredToolkitTailwind = false;

const layerToolkitTailwind = {
  name: "layer-toolkit-tailwind",
  transform(code, id) {
    if (!id.includes(TOOLKIT_DIR) || !id.endsWith(TOOLKIT_TAILWIND_INJECT)) {
      return null;
    }
    // Wrap at the injection site rather than rewriting the css literal, so the
    // 85KB string is left exactly as the toolkit generated it.
    const marker = "document.createTextNode(css)";
    if (!code.includes(marker)) {
      this.warn(
        `${TOOLKIT_TAILWIND_INJECT} no longer injects via ${marker} — its ` +
          `utilities are shipping unlayered and will override the theme's`
      );
      return null;
    }
    layeredToolkitTailwind = true;
    return {
      code: code.replace(
        marker,
        `document.createTextNode("@layer ${TOOLKIT_LAYER}{" + css + "}")`
      ),
      map: null,
    };
  },
  buildEnd() {
    // Silence is ambiguous here: the toolkit dropping this file and the plugin
    // failing to match it both look like "nothing happened" until a utility
    // silently stops responding to a breakpoint in the browser.
    if (layeredToolkitTailwind) {
      console.log(
        `\nWrapped the toolkit's injected Tailwind sheet in ` +
          `@layer ${TOOLKIT_LAYER}.\n`
      );
    }
    // Same reasoning for the component stylesheets: report what was demoted so
    // a rule the toolkit newly aims at the theme's class names is visible here
    // rather than as a mystery in the browser. A missing theme stylesheet
    // switches the check off entirely, which must never pass unremarked.
    if (!themeClassNames) {
      this.warn(
        `${THEME_STYLESHEET} is missing or empty — toolkit component CSS is ` +
          `shipping unlayered and can override the theme's utilities`
      );
    } else if (demotedToolkitRules.size) {
      console.log(
        `Demoted ${demotedToolkitRules.size} toolkit component rule(s) into ` +
          `@layer ${TOOLKIT_LAYER}: ${[...demotedToolkitRules].join(", ")}\n`
      );
    }
  },
};

// The toolkit's per-component stylesheets reach the page the same way and carry
// the same hazard: rollup-plugin-postcss injects each one as a plain <style> at
// import time, and an unlayered rule outranks every layered one regardless of
// order or specificity. Nearly everything they ship is namespaced to a
// component (.vg-input-control, .vg-tk-btn span), so it only ever meets the
// widget's own markup — but not all of it is. VgTextarea.css carries a bare
// `.hidden{display:none}`, which beat .lg\:flex in @layer utilities and pinned
// the header's `hidden lg:flex` desktop block (user menu, locale flag, Start
// Free Trial) to display:none at every viewport as soon as the chat chunk
// loaded.
//
// So demote those rules and only those: a rule goes into the layer when every
// class in its selector is one the theme's own stylesheet also styles, which is
// what makes it able to match markup outside the widget. One extra class of the
// toolkit's own (.toggle-btn.active) already pins it to the widget's DOM, so it
// stays put. Wrapping whole stylesheets instead is what the first cut did, and
// it drops every component rule below @layer utilities — including
// .vg-tk-btn span, whose font-size then loses to the text-xs the widget puts on
// the same button.
//
// Done as a postcss plugin rather than a custom `inject` function so the layer
// is baked into the CSS itself — it holds however the stylesheet reaches the
// page, including if this build ever switches to extracting it. Each rule is
// wrapped where it sits, so one inside @media stays inside it.
const THEME_STYLESHEET = "assets/output.css";
const demotedToolkitRules = new Set();

// Class names the theme's own stylesheet styles. Tailwind escapes anything
// exotic (.lg\:flex, .w-\[145px\]) and the toolkit's unnamespaced globals are
// all plain identifiers, so plain names are the only ones that can collide.
//
// Read once, at config load: under `yarn start` the tailwind CLI rewrites
// output.css on its own schedule, and rollup only re-reads this file when the
// config itself changes. A class name that starts colliding mid-session is
// therefore picked up on the next restart, not the next rebuild.
function readThemeClassNames() {
  try {
    const css = fs.readFileSync(THEME_STYLESHEET, "utf8");
    const names = new Set();
    for (const m of css.matchAll(/\.([A-Za-z_][\w-]*)(?![\w\\-])/g)) {
      names.add(m[1]);
    }
    return names.size ? names : null;
  } catch {
    return null;
  }
}

const themeClassNames = readThemeClassNames();

const selectorLeaksIntoTheme = (selector) => {
  const classes = [...selector.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(
    (m) => m[1]
  );
  if (!classes.length || classes.some((name) => name.startsWith("vg-"))) {
    return false;
  }
  return classes.every((name) => themeClassNames.has(name));
};

const layerToolkitComponentCss = {
  postcssPlugin: "layer-toolkit-component-css",
  // OnceExit rather than Once: run after any other plugin has had the file, so
  // nothing else has to know its rules are about to be nested.
  OnceExit(root, { AtRule }) {
    const file = root.source?.input?.file ?? "";
    if (!file.includes(TOOLKIT_DIR) || !themeClassNames) return;
    root.walkRules((rule) => {
      // Already inside a layer (ours, from a rule that shares this parent).
      if (rule.parent?.type === "atrule" && rule.parent.name === "layer")
        return;
      if (!rule.selectors.some(selectorLeaksIntoTheme)) return;
      const layer = new AtRule({ name: "layer", params: TOOLKIT_LAYER });
      rule.replaceWith(layer);
      layer.append(rule);
      demotedToolkitRules.add(`${path.basename(file)} ${rule.selector}`);
    });
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
      layerToolkitTailwind,
      // Toolkit 4.x ships its component styles as plain .css next to each
      // component (3.x inlined them via style-inject). Inject them at runtime
      // so the chat box is styled without the theme having to load an extra
      // stylesheet for a module that itself loads on demand.
      postcss({
        include: "**/*.css",
        inject: true,
        minimize: isProduction,
        plugins: [layerToolkitComponentCss],
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
