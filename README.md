# Vagaro Support Theme

The theme behind [support.vagaro.com](https://support.vagaro.com), based on Zendesk's
[Copenhagen](https://github.com/zendesk/copenhagen_theme) theme. It is a Zendesk Guide theme —
Handlebars templates plus a set of React modules — deployed to the `vagaro` Zendesk account.

It is a fork, so the upstream Copenhagen documentation below still applies (templates, manifest,
settings, i18n, accessibility). The sections that follow first are Vagaro-specific: how to
authenticate, how to preview against the live help center, and the build/commit rules you must
follow before pushing.

**The one rule to remember:** never commit without running `yarn build:release` first.
See [Building before you commit](#building-before-you-commit).

Contents:
- [Prerequisites](#prerequisites)
- [Authenticating with the Zendesk CLI](#authenticating-with-the-zendesk-cli)
- [Running the theme in preview mode](#running-the-theme-in-preview-mode)
- [Cross-domain preview on support.vagaro.com](#cross-domain-preview-on-supportvagarocom)
- [Previewing on a phone or tablet](#previewing-on-a-phone-or-tablet)
- [Building before you commit](#building-before-you-commit)
- [Versioning with `yarn build:release`](#versioning-with-yarn-buildrelease)
- [Committing (husky + commitlint)](#committing-husky--commitlint)
- [The full release checklist](#the-full-release-checklist)

---

## Prerequisites

```console
$ nvm use          # Node version from .nvmrc
$ yarn install
```

Two dependencies come from private Azure Artifacts feeds (`@vagaro/vagaro-react-toolkit` and
`vera-chat-widget`). The registries are declared in the committed `.npmrc`; the auth tokens are
**not** — they belong in your personal `~/.npmrc`, which yarn merges with the project file. If
`yarn install` 401s or 404s on either package, your `~/.npmrc` token is missing or expired.

---

## Authenticating with the Zendesk CLI

Preview, upload, and every other `zcli` command require a logged-in profile. `zcli` ships as a dev
dependency, so run it through yarn rather than installing it globally.

```console
$ yarn zcli login -i
```

The interactive prompt asks for three things:

| Prompt      | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Subdomain   | `vagaro` (the account is `vagaro.zendesk.com`, host-mapped to `support.vagaro.com`) |
| Email       | your Vagaro Zendesk admin email                                       |
| Password    | your password, or an API token if the account requires SSO/2FA        |

If your Zendesk sign-in goes through SSO or has 2FA enabled, a password will not work. Generate an
API token in **Zendesk Admin Center → Apps and integrations → APIs → Zendesk API → API tokens**,
then log in with the token as the password and `your-email/token` as the email:

```console
$ yarn zcli login -i
# Email: you@vagaro.com/token
# Password: <API token>
```

You need the **Guide Manager / theme admin** role on the account — an agent-only account will
authenticate but fail on `themes:preview` with a 403.

`zcli` writes the active profile to `~/.zcli` (a JSON file, not a directory). To check who you are
currently authenticated as:

```console
$ node -p "JSON.parse(require('fs').readFileSync(process.env.HOME + '/.zcli')).activeProfile.subdomain"
vagaro
```

To switch accounts, run `yarn zcli login -i` again — it overwrites the active profile. Never commit
`~/.zcli` contents or paste the token anywhere in this repo.

---

## Running the theme in preview mode

```console
$ yarn start
```

This runs three processes concurrently:

1. **Rollup** in watch mode — rebuilds `script.js` and the `assets/*-bundle.js` module bundles;
2. **Tailwind** in watch mode — recompiles `styles/input.css` → `assets/output.css`;
3. **`zcli themes:preview`** — serves the theme from `http://localhost:4567` once `script.js` and
   `style.css` exist (`wait-on` handles the ordering, so the first start is slower).

`zcli themes:preview` only serves the files; the rendering still happens on Zendesk's side. It
prints a preview link and, in most setups, opens the help center for you with the local theme
attached.

**You must be signed in to the help center as an admin in the same browser** for the preview to
attach. The preview handshake is authenticated — if you are signed out, or signed in as an end
user, the page silently renders the *published* theme instead, which looks almost identical and
will have you debugging changes that were never loaded. When something you just edited does not
show up, check that first.

Preview session notes:

- The local server is unminified and slow on first paint — that is expected in watch mode.
- Preview lasts for the browser session. Any full page load that is not the `local_preview/start`
  URL drops it.
- To end it deliberately, visit `https://support.vagaro.com/hc/admin/local_preview/stop`.

---

## Cross-domain preview on support.vagaro.com

The Vagaro help center is host-mapped to `support.vagaro.com`, not `vagaro.zendesk.com`. Because
of that, the automatic preview redirect does not always land on the right domain, and cookies set
on `vagaro.zendesk.com` do not apply to `support.vagaro.com`. Start the preview explicitly against
the mapped host instead:

```
https://support.vagaro.com/hc/admin/local_preview/start?theme_server_url=http://localhost:4567
```

With `yarn start` already running, paste that URL into a browser where you are signed in as a
Zendesk admin. The help center then loads on its real domain while pulling `script.js`,
`style.css`, and every `assets/*` file from your machine.

Use this form whenever the work depends on the real origin — anything touching cookies, session or
auth state (`s_utkn` and friends are scoped to `.vagaro.com`), CORS calls to Vagaro APIs, the Vera
chat widget, or `postMessage` between the help center and Vagaro properties. Testing those on
`vagaro.zendesk.com` will give you misleading results.

Notes:

- `theme_server_url` must match the scheme, host, and port the theme server is actually on. The
  default is `http://localhost:4567`; override the port with `PORT`, and pass the same value here.
- `http://localhost` is exempt from mixed-content blocking even though the page is HTTPS, which is
  why plain `http` works here. Any other host must be HTTPS — see the LAN section below.
- If you get bounced to a sign-in page, you are not authenticated as an admin on
  `support.vagaro.com`. Sign in there first, then re-open the `local_preview/start` URL.
- Re-open the whole URL after any hard reload. Reloading the page alone drops back to the
  published theme.

---

## Previewing on a phone or tablet

```console
$ yarn start:lan
```

`bin/lan-preview.sh` mints a `mkcert` certificate for your current LAN IP, serves the theme over
HTTPS, and prints the exact `local_preview/start` URL to open on the device. HTTPS is mandatory
here: `support.vagaro.com` is TLS, and unlike `localhost`, a plain `http://<lan-ip>` origin is
blocked as mixed content — Safari drops the stylesheet and scripts and you end up looking at what
appears to be the published theme.

Requires `mkcert` (`brew install mkcert`) and the generated root CA installed and fully trusted on
the device.

---

## Building before you commit

**Do not commit without running a production build first.** This is the most common way to break
the theme, and the failure only appears at deploy time.

The compiled output — `script.js`, `style.css`, `assets/output.css`, and every
`assets/*-bundle.js` — is **committed to the repository**. Zendesk installs the theme from these
files; it does not run the build. So whatever bundle state is in your commit is exactly what ships.

`yarn start` produces development bundles. `terser` only runs when `NODE_ENV=production`
(`rollup.config.mjs` gates it on `isProduction`), so a watch-mode bundle is unminified, keeps its
`console.*` calls, and — for `script.js` — has `process.env.NODE_ENV` replaced with `development`,
which pulls in React's development build and its warning machinery instead of the production one.
Rollup tree-shakes in both modes, but without minification and with the dev React paths retained
the result is roughly 1.2 MB versus ~260 KB for `script.js` alone.

That matters because **Zendesk enforces an 800 KB limit on the theme package**. Commit dev bundles
and the import fails with *"Theme exceeds 800KB"* — after the merge, in the deploy, not on your
machine.

There is no pre-commit hook that builds for you. Husky only validates the commit message (see
below), so this step is on you.

```console
$ yarn build:release        # version bump + production build — the normal path
$ yarn build                # production build only, no version bump
```

Sanity checks before you stage:

```console
$ ls -lh script.js style.css assets/output.css
$ wc -l script.js           # minified: a couple dozen lines, not tens of thousands
$ head -c 200 script.js     # should be unreadable, not formatted source
```

Rough expected sizes: `script.js` ~260 KB, `style.css` ~180 KB, `assets/output.css` ~220 KB. A
`script.js` over 500 KB, or with 36,000+ lines, is an unminified build — rebuild before committing.

`prebuild` deletes `assets/*-bundle.js` before every build, so stale bundles from a renamed or
removed module do not linger in the repo. If a bundle disappears from the working tree after a
build, that is why — stage the deletion.

---

## Versioning with `yarn build:release`

```console
$ yarn build:release        # patch: 4.0.111 → 4.0.112, then production build
$ yarn build:minor          # minor: 4.0.111 → 4.1.0, then production build
$ yarn build:major          # major: 4.0.111 → 5.0.0, then production build
```

Each of these runs `bin/version-bump.js` and then `NODE_ENV=production rollup -c`. The bump updates
the `version` field in **both** `package.json` and `manifest.json` and keeps them in sync —
`manifest.json` is the version Zendesk shows in Theming Center, so a bump that misses it makes the
deployed theme indistinguishable from the previous one in the UI.

Bump the version on every change you intend to deploy. It is how you confirm in Theming Center that
the theme actually updated, and it is the first thing to check when a fix appears not to have
landed.

To bump without building — rare, and you still owe a build before committing:

```console
$ yarn version:patch        # or version:minor / version:major
```

---

## Committing (husky + commitlint)

`.husky/commit-msg` runs `commitlint` against every commit message using
[`@commitlint/config-conventional`](https://github.com/conventional-changelog/commitlint). A message
that does not parse is **rejected locally** — the commit is not created — and the same check runs
again in CI (`.github/workflows/checks.yml`) across every commit in a pull request.

The format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Rules that actually trip people up:

- The type must be one of the supported types below, lowercase, followed by `: ` — `chore: fix nav`,
  not `Chore: fix nav` or `chore fix nav`.
- The description is lowercase and has no trailing period.
- The header stays under 100 characters.
- Blank line required between header, body, and footer.

```console
$ git commit -m "fix(nav): correct mobile menu overflow"        # ok
$ git commit -m "chore: bump version to 4.0.112"                # ok
$ git commit -m "Updated the nav."                              # rejected
```

If husky does not fire at all, `yarn install` did not run its `prepare` script — run `yarn husky install`.

To pair the version bump with its commit:

```console
$ git commit -m "chore: bump version to $(node -p "require('./package.json').version")"
```

`--no-verify` skips the hook. Don't — CI runs the same lint on the whole PR and will fail there.

---

## The full release checklist

```console
$ yarn build:release                       # 1. bump version + production build
$ ls -lh script.js style.css               # 2. confirm the bundles are minified
$ yarn test && yarn eslint                 # 3. same checks CI runs
$ git add -A                               # 4. include the rebuilt bundles and both version files
$ git commit -m "fix(scope): what changed" # 5. conventional commit — husky validates it
$ git push
```

Merging to `master` triggers `.github/workflows/release.yml`, which builds and runs
`semantic-release` (commit analysis → tag → changelog). Zendesk then syncs the theme from GitHub.
A manual upload is also available:

```console
$ yarn zcli themes:upload
```

`.zcliignore` controls what gets packaged — `src/`, `bin/`, docs, and non-English translation
bundles are excluded to stay under the 800 KB limit. If you add large files to the repo, check
whether they need an entry there.

---

# Upstream Copenhagen documentation

The rest of this README is Zendesk's Copenhagen documentation, kept as-is. Where it refers to "the
Copenhagen theme", it applies to this fork too.

## How to use
This is the latest version of the Copenhagen theme available for Guide. It is possible to use this repository as a starting point to build your own custom theme. You can fork this repository as you see fit.
You can use your favorite IDE to develop themes and preview your changes locally in a web browser using [ZCLI](https://github.com/zendesk/zcli/). For details, read the [zcli themes](https://github.com/zendesk/zcli/blob/master/docs/themes.md) documentation.

## Customizing your theme
Once you have forked this repository you can feel free to edit templates, CSS, JavaScript and manage assets.

### Manifest file
The manifest allows you to define a group of settings for your theme that can then be changed via the UI in Theming Center.
You can read more about the manifest file [here](https://support.zendesk.com/hc/en-us/articles/115012547687).

### Settings folder
If you have a variable of type `file`, you need to provide a default file for that variable in the `/settings` folder. This file will be used on the settings panel by default and users can upload a different file if they like.
Ex.
If you would like to have a variable for the background image of a section, the variable in your manifest file would look something like this:

```js
{
  ...
  "settings": [{
    "label": "Images",
    "variables": [{
      "identifier": "background_image",
      "type": "file",
      "description": "Background image for X section",
      "label": "Background image",
    }]
  }]
}

```

And this would look for a file inside the settings folder named: `background_image`

### Adding assets
You can add assets to the asset folder and use them in your CSS, JavaScript and templates.
You can read more about assets [here](https://support.zendesk.com/hc/en-us/articles/115012399428)

## Publishing your theme
After you have customized your theme you can download the repository as a `zip` file and import it into Theming Center.

You can follow the documentation for importing [here](https://support.zendesk.com/hc/en-us/articles/115012794168).

You can also import directly from GitHub - learn more [here](https://support.zendesk.com/hc/en-us/articles/4408832476698-Setting-up-the-GitHub-integration-with-your-Guide-theme).

## Templates
The theme includes all the templates that are used for a Help Center that has *all* the features available.
List of templates in the theme:
* Article page
* Category page
* Community post list page
* Community post page
* Community topic list page
* Community topic page
* Contributions page
* Document head
* Error page
* Footer
* Header
* Home page
* New community post page
* New request page
* Requests page
* Search results page
* Section page
* Subscriptions page
* User profile page

You can add up to 10 optional templates for:
 * Article page
 * Category page
 * Section page

You do this by creating files under the folders `templates/article_pages`, `templates/category_pages` or `templates/section_pages`.
Learn more [here](https://support.zendesk.com/hc/en-us/articles/360001948367).

## Stylesheet and JavaScript

We use Rollup to compile the JS and CSS files that are used in the theme - `style.css` and `script.js`. Do not edit these directly as they'll be regenerated during release.

To get started:

```console
$ yarn install
$ yarn start
```

This will compile all the source code in `src` and `styles` and watch for changes. It will also start `preview`.

Notes:

- We intentionally do not use babel when compiling `script.js` so we can get a clean bundle output. Make sure to only use widely supported ecmascript features (ES2015).
- Do not edit `style.css`, `script.js` and the files inside the `assets` folder directly. They are regenerated during release.
- Preview requires login so make sure to first run `yarn zcli login -i` if you haven't done that before.
  See [Authenticating with the Zendesk CLI](#authenticating-with-the-zendesk-cli) for the Vagaro account details,
  and [Cross-domain preview on support.vagaro.com](#cross-domain-preview-on-supportvagarocom) for previewing on the mapped domain.

## Assets
The Copenhagen theme comes with a few JavaScript assets, but you can add other assets to your theme by placing them in the `assets` folder.

# React components

From version 4.0.0, the Copenhagen theme uses some React components to render parts of the UI. These components are located in the `src/modules` folder and are built using the [Zendesk Garden](https://garden.zendesk.com/) component library.

These components are bundled as native [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) as part of the Rollup build process, and they are emitted as JS files in the `assets` folder. Since assets are renamed when a theme is installed, the modules needs to be imported using the [asset helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#asset-helper). 

To make the process of importing the modules easier, we added a Rollup plugin that generates an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) that maps the module name to the asset URL. This import map is then injected into the `document_head.hbs` template during the build.

For example, if you defined a module named `my-module` in the `src/modules/my-module` folder, you can add it to the `rollup.config.mjs` file like this:

```js
export default defineConfig([
  // ...
  // Configuration for bundling modules in the src/modules directory
  {
    // ...
    input: {
      "my-module": "src/modules/my-module/index.js",
    },
    // ...
  }
]);
```

Rollup will generate a file named `my-module-bundle.js` in the `assets` folder and this import map will be added to the `document_head.hbs` template:

```html
<script type="importmap">
{
  "imports": {
    "my-module": "{{asset 'my-module-bundle.js'}}",
  }
}
</script>
```

You can then import the module in your templates like this:

```hbs
<script type="module">
  import { something } from "my-module";

  // ...
</script>
```

## Internationalization

I18n is implemented in the React components using the [react-i18next](https://react.i18next.com/) library. We use a flat JSON file and we use `.` as a separator for plurals, which is different from the default `_` and it is configured during initialization.

We also added some tools to be able to integrate the library with the internal translation system used at Zendesk. If you are building a custom theme and you want to provide your own translations you can refer to the library documentation to setup the loading of your translations.

### Integration with the Zendesk translation system

#### Adding translations strings

Translation strings are added directly in the source code, usually using the `useTranslation` hook, passing the key and the default English value:

```ts
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <div>{t("my-key", "My default value")}</div>
}
```

Providing the default English value in the code makes it possible to use it as a fallback value when strings are not yet translated and to extract the strings from the source code to the translations YAML file.

#### Plurals 
When using [plurals](https://www.i18next.com/translation-function/plurals), we need to provide default values for the `zero`, `one`, and `other` values, as requested by our translation system. This can be done by passing the default values in the [options](https://www.i18next.com/translation-function/essentials#overview-options) of the `t` function.

```ts
t("my-key", {
  "defaultValue.zero": "{{count}} items",
  "defaultValue.one": "{{count}} item",
  "defaultValue.other": "{{count}} items",
  count: ...
})
```

#### String extraction

The `bin/extract-strings.mjs` script can be used to extract translation strings from the source code and put them in the YAML file that is picked up by our internal translation system. The usage of the script is documented in the script itself.

The script wraps the `i18next-parser` tool and converts its output to the YAML format used internally. It is possible to use a similar approach in a custom theme, either using the standard `i18next-parser` output as the source for translations or implementing a custom transformer.

#### Updating translation files

Use the `bin/update-modules-translations.mjs` to download the latest translations for all the modules. All files are then bundled by the build process in a single `[MODULE]-translations-bundle.js` file.

The first time that translations are added to a module, you need to add a mapping between the module folder and the package name on the translations systems to the `MODULE` variable in the script. For example, if a module is located in `src/modules/my-module` and the package name is `cph-theme-my-module`, you need to add:

```js
const MODULES = {
  ...,
  "my-module": "cph-theme-my-module"
}
```

# Accessibility testing

We use a custom node script that runs [lighthouse](https://github.com/GoogleChrome/lighthouse) for automated accessibility testing.

There are two ways of running the script:
- **Development mode** - it runs the accessibility audits on the local theme preview, on a specific account. It requires `zcli themes:preview` to be running;
- **CI mode** - it runs the accessibility audits on the live theme of a specific account.

Depending on the scope of testing, some manual testing might be needed in addition to the above.
Tools like [axe DevTools](https://www.deque.com/axe/devtools/), screen readers e.g. [VoiceOver](https://www.apple.com/voiceover/info/guide/_1121.html), [contrast checkers](https://webaim.org/resources/contrastchecker/) etc. can assist such testing.

## Development mode

To run the accessibility audits while changing the theme:

1. Start compiling and previewing changes like you normally would:

```console
$ yarn install
$ yarn start
```

2. Create a `.a11yrc.json` file in the root folder (see [example](.a11yrc.json.example));
   1. Specify the account/subdomain to preview the theme making sure it matches the active `zcli` profile
   2. Fill `username` and `password` with the credentials of an admin user;
   3. Specify which `urls` to test (if left empty, the script will test all urls);

3. In a separate console, run the accessibility audits in development mode:

```console
yarn test-a11y -d
```

A11y audits will then run on the preview started in step `1`.

## CI mode

To run the accessibility audits on the live theme of a specific account, one must:

1. Install node modules:

```console
yarn install
```

2. Set `end_user_email`, `end_user_password`, `subdomain` and `urls` as environment variables and run the accessibility audits in CI mode i.e.:

```console
end_user_email=<EMAIL> \
end_user_password=<PASSWORD> \
subdomain=<SUBDOMAIN> \
urls="
    https://<SUBDOMAIN>.zendesk.com/hc/en-us/
    https://<SUBDOMAIN>.zendesk.com/hc/en-us/requests/new
    https://<SUBDOMAIN>.zendesk.com/hc/en-us/requests" \
yarn test-a11y
```

## Ignore list

If there is a known accessibility issue that should be ignored or can't be fixed right away, one may add a new entry to the ignore list in the [script's configuration object](bin/lighthouse/config.js). This will turn the accessibility issue into a warning instead of erroring.

The entry should include:
- the audit id;
- a `path` as a url pattern string;
- a `selector` as a string.

For example:

```js
  custom: {
    ignore: {
      tabindex: [
        {
          path: "*",
          selector: "body > a.skip-navigation",
        },
      ],
      aria-allowed-attr: [
        {
          path: "/hc/:locale/profiles/:id",
          selector: "body > div.profile-info"
        }
      ]
    },
  },
```

In this example, errors for the audit `tabindex` with the selector `body > a.skip-navigation` will be reported as warnings in all pages (`*`). The same will happen for the audit `aria-allowed-attr` with the selector `body > div.profile-info`, but only for the user profile page `/hc/:locale/profiles/:id`.

Please keep in mind that this should only be used when strictly necessarity. Accessibility should be a focus and a priority when making changes to the theme.

# Contributing

> For this fork, open pull requests against this repository, not upstream. The husky/commitlint
> rules described below are the ones enforced here — see
> [Committing (husky + commitlint)](#committing-husky--commitlint) for the practical version, and remember
> that [a production build is required before every commit](#building-before-you-commit).

Upstream guidance: pull requests are welcome on GitHub at https://github.com/zendesk/copenhagen_theme. Please mention @zendesk/vikings when creating a pull request.

We use [conventional commits](https://conventionalcommits.org/) to improve readability of the project history and to automate the release process. The commit message should therefore respect the following format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

```

- type: describes the category of the change. See [supported types](#commit-types).
- scope: (optional) describes what is affected by the change
- subject: a small description of the change
- body: (optional) additional contextual information about the change
- footer: (optional) adds external links, issue references and other meta-information

i.e.:

```
chore: automate release
fix(styles): fix button padding
feat(script): add auto focus to fields with errors
```

We use [`husky`](https://github.com/typicode/husky) and [`commitlint`](https://github.com/conventional-changelog/commitlint) to validate messages when commiting.

We use [Github actions](https://github.com/features/actions) together with [`semantic-release`](https://github.com/semantic-release/semantic-release) to release a new version of the theme once a PR gets merged. On each merge, `semantic-release` analyses the commit messages and infers a semantic version bump. It then creates a git tag, updates the manifest version and generates the corresponding [changelog](CHANGELOG.md).

## Commit types

The list bellow describes the supported commit types and their effect in the release and changelog.

| Type     | Description                                                                                            | Release | Changelog                |
|----------|--------------------------------------------------------------------------------------------------------|---------|--------------------------|
| build    | Changes that affect the build system or external dependencies                                          | -       | -                        |
| chore    | Other changes that don't modify the source code                                                        | -       | -                        |
| ci       | Changes to our CI configuration files and scripts                                                      | -       | -                        |
| docs     | Documentation only changes                                                                             | -       | -                        |
| feat     | A new feature                                                                                          | minor   | Features                 |
| fix      | A bug fix                                                                                              | patch   | Bug Fixes                |
| perf     | A code change that improves performance                                                                | patch   | Performance Improvements |
| refactor | A code change that neither fixes a bug nor adds a feature                                              | -       | -                        |
| revert   | Reverts a previous commit                                                                              | patch   | Reverts                  |
| style    | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) | -       | -                        |
| test     | Adding missing tests or correcting existing tests                                                      | -       | -                        |

## Breaking changes

Commits that add a breaking change should include `BREAKING CHANGE` in the body or footer of the commit message.

i.e.:

```
feat: update theme to use theming api v2

BREAKING CHANGE: theme is now relying on functionality that is exclusive to the theming api v2
```

This will then generate a major release and add a `BREAKING CHANGES` section in the [changelog](CHANGELOG.md).

# Bug reports

Bugs in the Vagaro theme belong in this repository's issue tracker or the team's normal intake.
Bugs in Zendesk Guide itself must be submitted through Zendesk's standard support channels:
https://www.zendesk.com/contact/
