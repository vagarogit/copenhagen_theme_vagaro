# Proposal: Tree-shakeable builds for `@vagaro/vagaro-react-toolkit`

**Audience:** Vagaro React Toolkit team
**From:** Help Center (Zendesk theme) / Vera chat integration
**Date:** 2026-08-07

## Problem

`vera-chat-widget` peer-depends on `@vagaro/vagaro-react-toolkit` and imports
**five** components:

```ts
import { VgVeraChatBox, VgPopup, VgButton, VgInput, VgAvatar } from '@vagaro/vagaro-react-toolkit';
```

Bundling this in the Zendesk help center theme (Rollup, production build)
produces a **13.33 MB** vendor chunk — effectively the toolkit's entire
`dist/index.esm.js` (13 MB) passing through untouched, plus SignalR and the
widget itself.

Consequences for the help center:

- 13 MB of JavaScript downloaded on every page for a chat widget whose own
  components need a fraction of it.
- The chunk will likely exceed Zendesk Guide's per-asset upload limit,
  **blocking deployment** of Vera chat to support.vagaro.com.
- The toolkit's unused `react-filerobot-image-editor` import reaches consumer
  bundles as an unresolvable bare import; we currently stub it out in the
  theme's build to avoid a runtime module-resolution failure.

Any other lightweight consumer of the toolkit (marketing pages, embeds,
micro-frontends) pays the same 13 MB tax.

## Why tree-shaking cannot help today

This is not a consumer-side configuration problem — the published package
defeats tree-shaking structurally:

1. **Monolith by construction.** `rollup.config.js` uses a single
   `input: 'src/index.ts'`, a single `output.file`, and
   `inlineDynamicImports: true`. The only possible output is one file.
   The `dist/components/*` directories contain **only `.d.ts` files** — there
   is no granular JavaScript for consumers (or bundlers) to reach for.

2. **Runtime dependencies are inlined.** `peerDepsExternal()` externalizes
   peers only, and the manual `external` list stops at
   `react-filerobot-image-editor` / `filerobot-image-editor`. Everything in
   `dependencies` is bundled into the file: **video.js, videojs-youtube,
   xlsx-js-style, apexcharts, moment, axios**, Lexical, and more.

3. **CSS as top-level side effects.** `postcss({ inject: true })` compiles
   every component's SCSS into `style-inject` calls. Flattened into one
   module, these execute at module-init. Downstream bundlers must keep any
   statement they cannot prove side-effect-free — so they keep essentially
   everything. (The same applies to other top-level mutations in the inlined
   libraries, e.g. moment's plugin/prototype patching.)

The package's `"sideEffects": ["*.scss"]` hint operates at *module*
granularity — and there is only one module, which is genuinely imported.

For scale: the five components Vera chat uses are small and clean. Four of
them (`VgAvatar`, `VgButton`, `VgInput`, `VgPopup`) import nothing beyond
React; `VgVeraChatBox` additionally uses `@lexical/*` for its composer. None
of them touch video.js, xlsx, apexcharts, or moment.

## Proposed change

Publish a **module-preserving ESM build** with dependencies externalized. The
CJS monolith can remain as-is for legacy consumers.

### `rollup.config.js`

```js
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  input: 'src/index.ts',
  output: [
    // Legacy monolith (unchanged) — keep for existing CJS consumers.
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      inlineDynamicImports: true,
      banner: 'var global = globalThis || window || self;',
    },
    // NEW: granular ESM build — one output file per source module.
    {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      banner: 'var global = globalThis || window || self;',
      // NOTE: inlineDynamicImports must NOT be set here — it is
      // incompatible with preserveModules.
    },
  ],
  external: [
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.dependencies ?? {}), // stop inlining video.js & friends
    /^react\//,
    /^@lexical\//,
    /^videojs-/,
  ],
  // ...existing plugins unchanged (postcss inject:true is fine once modules
  // are preserved — each component's style-inject lives in its own module)...
});
```

### `package.json`

```jsonc
{
  "main": "dist/index.cjs.js",
  "module": "dist/esm/index.js",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/index.cjs.js"
    }
  },
  // Style injection is a real side effect — declare it so bundlers keep the
  // CSS of the components a consumer actually imports and drop the rest.
  "sideEffects": ["**/*.scss", "**/*.css"]
}
```

## Expected impact

- A consumer importing the five Vera chat components loads those five
  modules, the shared utils they reference, and Lexical from `node_modules` —
  realistically **a few hundred KB instead of 13 MB** (exact number to be
  confirmed after a trial build).
- The `react-filerobot-image-editor` phantom import disappears for consumers
  that don't import the image-editor component — its module simply never
  enters the graph. Consumer-side stubs can be deleted.
- Dashboard/admin apps that use charts or video import those components and
  pull apexcharts/video.js **from node_modules** — same functionality, now
  resolved by the consumer's bundler rather than shipped as inlined copies.

## Risks / migration notes

- **Externalized dependencies:** consumers' bundlers now resolve
  `moment`, `video.js`, etc. from `node_modules`. These are already declared
  in `dependencies`, so npm installs them automatically — this is the
  standard library packaging pattern — but consumer bundle-size accounting
  will shift (toolkit shrinks, vendored deps appear under their own names).
- **CJS consumers:** unaffected (monolith retained).
- **Deep-import consumers:** anyone importing
  `@vagaro/vagaro-react-toolkit/dist/...` paths today (vera-chat-widget does
  this in one place for `VgVeraChatBox` types) should move to root imports or
  the new `dist/esm/` paths; an `exports` map can enforce/redirect this.

## Validation checklist

1. `npm run build` produces `dist/esm/**` with one file per source module.
2. A scratch consumer that imports only `VgButton` bundles to a few KB plus
   React (verify with `rollup --plugin @rollup/plugin-node-resolve` or a
   Vite build + `rollup-plugin-visualizer`).
3. vera-chat-widget's host (Zendesk theme) rebuild: `vera-vendor` chunk drops
   from 13.33 MB to the expected few hundred KB, chat renders and styles
   correctly (style-inject still fires for imported components).
4. A charts/video consumer renders correctly with externalized
   apexcharts/video.js.

---
*Measurements taken 2026-08-07 against `@vagaro/vagaro-react-toolkit@3.9.9`
(`dist/index.esm.js` = 13 MB) and `vera-chat-widget@0.5.7`, bundled with
Rollup 4 / NODE_ENV=production in the Zendesk help center theme.*
