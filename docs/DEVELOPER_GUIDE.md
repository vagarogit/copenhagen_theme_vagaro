# Copenhagen Theme (Vagaro) - Developer Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features & Components](#core-features--components)
6. [Development Workflow](#development-workflow)
7. [Build System](#build-system)
8. [Styling System](#styling-system)
9. [Internationalization](#internationalization)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Planned Improvements](#planned-improvements)

---

## Overview

**Copenhagen Theme** is the official Zendesk Guide theme customized for Vagaro. It's a modern, responsive help center solution that combines traditional server-rendered templates with interactive React components.

**Version**: 4.0.24
**Repository**: `git@github.com:zendesk/copenhagen_theme.git` (forked for Vagaro)
**Node Version**: 18.12.1 (specified in `.nvmrc`)
**Package Manager**: Yarn 1.22.22

### Key Characteristics
- Hybrid architecture: Handlebars templates + React components
- Responsive & accessible (WCAG 2.1 AA compliant)
- Multi-language support (20+ languages via i18next)
- Customizable via manifest settings
- Modern build system using Rollup + Tailwind

---

## Architecture

### Hybrid Template-Component Model

The theme uses a **two-tier architecture**:

#### Tier 1: Server-Rendered Templates (Handlebars/Curlybars)
- Located in `templates/` directory
- Rendered server-side by Zendesk
- Define page structure and layout
- Pass data to React components via JSON in script tags

#### Tier 2: Client-Side React Modules
- Located in `src/modules/` directory
- Bundled as ES modules with import maps
- Enhance specific features with interactivity
- Use Zendesk Garden component library
- TypeScript with strict type checking

### Data Flow

```
Zendesk Platform
    ↓ (renders)
Handlebars Templates (.hbs)
    ↓ (injects data via JSON)
React Modules (.tsx)
    ↓ (uses)
Zendesk Garden Components
```

### Example: New Request Form Integration

**Template** (`templates/new_request_page.hbs`):
```handlebars
<div id="new-request-form"></div>
<script type="module">
  import { renderNewRequestForm } from "new-request-form";

  const props = {
    requestForm: {{json new_request_form}},
    wysiwyg: {{{json wysiwyg}}},
    // ... more props
  };

  renderNewRequestForm(
    settings,
    props,
    document.getElementById("new-request-form")
  );
</script>
```

**React Module** (`src/modules/new-request-form/renderNewRequestForm.tsx`):
```typescript
export function renderNewRequestForm(
  settings: Settings,
  props: Props,
  container: HTMLElement
) {
  const root = createRoot(container);
  root.render(
    <ThemeProviders themeName={settings.theme_name}>
      <NewRequestForm {...props} />
    </ThemeProviders>
  );
}
```

---

## Technology Stack

### Frontend Frameworks
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 17.0.2 | Component library for UI modules |
| TypeScript | 5.1.6 | Type-safe development |
| Handlebars | - | Template engine (Curlybars variant) |
| Tailwind CSS | 4.1.3 | Utility-first CSS framework |
| Styled Components | 5.3.11 | CSS-in-JS for React |

### UI Library
- **Zendesk Garden 8.76.2**: Comprehensive component library
  - Buttons, Forms, Modals, Notifications
  - Datepickers, Dropdowns, Accordions, Tags
  - Built-in accessibility & theme support

### Build & Bundling
- **Rollup 3.17.3**: ES module bundler
- **Babel 7.27.7**: JSX transpilation
- **Sass 1.58.3**: CSS preprocessing
- **PostCSS 8.5.6**: CSS transformations

### Testing & Quality
- **Jest 29.6.1**: Unit testing
- **React Testing Library**: DOM testing
- **Lighthouse 10.0.1**: Accessibility audits
- **ESLint 8.35.0**: Code linting
- **Prettier 2.8.4**: Code formatting

### Development Tools
- **ZCLI 1.0.0-beta.40**: Zendesk CLI for preview & theme management
- **Husky 8.0.2**: Git hooks for commit linting
- **Semantic Release 19.0.5**: Automated versioning

---

## Project Structure

```
copenhagen_theme_vagaro/
├── bin/                              # Build & utility scripts
│   ├── lighthouse/                   # Accessibility testing
│   ├── extract-strings.mjs          # i18n string extraction
│   ├── update-translations.js       # Download translations
│   ├── update-modules-translations.mjs
│   └── theme-upload.js              # Upload to Zendesk
│
├── src/                              # Source code
│   ├── index.js                     # Main entry point
│   ├── modules/                     # React modules
│   │   ├── new-request-form/        # Support request form
│   │   │   ├── NewRequestForm.tsx
│   │   │   ├── fields/              # Form field components
│   │   │   ├── answer-bot-modal/    # AI answer bot
│   │   │   ├── data-types/          # TypeScript interfaces
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   └── translations/        # i18n files
│   │   ├── flash-notifications/     # Toast notifications
│   │   ├── category-accordions/     # Collapsible categories
│   │   └── shared/                  # Shared utilities
│   │       ├── i18n/                # i18n initialization
│   │       ├── garden-theme/        # Garden theme config
│   │       └── notifications/       # Notification system
│   │
│   ├── Vanilla JS Utilities (no deps)
│   ├── Dropdown.js                  # Accessible dropdown
│   ├── navigation.js                # Mobile menu
│   ├── forms.js                     # Form behaviors
│   ├── search.js                    # Search functionality
│   └── ... (more utilities)
│
├── styles/                           # SCSS source files
│   ├── index.scss                   # Main stylesheet
│   ├── input.css                    # Tailwind input
│   ├── _variables.scss              # Theme variables
│   └── ... (28 SCSS partials)
│
├── templates/                        # Handlebars templates
│   ├── document_head.hbs            # HTML head + import maps
│   ├── header.hbs                   # Page header
│   ├── footer.hbs                   # Page footer
│   ├── home_page.hbs                # Homepage
│   ├── article_page.hbs             # Article view
│   ├── new_request_page.hbs         # Request form
│   ├── search_results.hbs           # Search page
│   └── ... (20+ templates)
│
├── assets/                           # Compiled assets
│   ├── script.js                    # Main bundle (IIFE)
│   ├── *-bundle.js                  # React modules (ES)
│   ├── style.css                    # Compiled SCSS
│   ├── output.css                   # Tailwind output
│   └── *.svg                        # Icons & images (100+)
│
├── Configuration Files
│   ├── package.json                 # Dependencies
│   ├── manifest.json                # Theme settings
│   ├── tsconfig.json                # TypeScript config
│   ├── rollup.config.mjs            # Bundle config
│   ├── jest.config.mjs              # Test config
│   └── .eslintrc.js                 # Linting rules
│
└── Documentation
    ├── README.md                    # Project docs
    ├── CHANGELOG.md                 # Version history
    └── DEVELOPER_GUIDE.md           # This file
```

---

## Core Features & Components

### 1. New Request Form Module
**Location**: `src/modules/new-request-form/`
**Entry Point**: `NewRequestForm.tsx`

The most complex module providing a dynamic support ticket submission system.

#### Features
- **Multiple Field Types**: Input, Textarea, Dropdown, Checkbox, MultiSelect, DatePicker, CreditCard, Tagger
- **File Attachments**: Drag & drop with validation (`src/modules/new-request-form/fields/attachments/`)
- **WYSIWYG Editor**: Rich text editor for descriptions
- **Conditional Fields**: Show/hide based on user conditions (`getVisibleFields.tsx`)
- **Answer Bot**: AI-powered suggestions modal (`answer-bot-modal/AnswerBotModal.tsx`)
- **Suggested Articles**: Real-time KB article suggestions while typing
- **Prefilled Fields**: Auto-populate from query parameters (`usePrefilledTicketFields.tsx`)
- **Multi-language**: Full i18n support with 20+ languages

#### Key Files
- `NewRequestForm.tsx:1` - Main component managing state
- `renderNewRequestForm.tsx:1` - React renderer for template integration
- `useFormSubmit.tsx:1` - Form submission logic
- `fields/` - Individual field components
- `data-types/Field.ts:1` - TypeScript field interfaces

#### Field Component Example
```typescript
// src/modules/new-request-form/fields/Input.tsx
interface InputProps {
  field: Field;
  hasMargin?: boolean;
  onChange: (value: string) => void;
}

export const Input: FC<InputProps> = ({ field, onChange }) => {
  return (
    <Field>
      <Label>{field.label}</Label>
      <Input
        value={field.value}
        onChange={(e) => onChange(e.target.value)}
        validation={field.error ? "error" : undefined}
      />
      {field.error && <Message validation="error">{field.error}</Message>}
    </Field>
  );
};
```

---

### 2. Flash Notifications Module
**Location**: `src/modules/flash-notifications/`
**Entry Point**: `FlashNotifications.tsx`

Toast notification system for user feedback.

#### Features
- Type-safe notifications: success, error, warning, info
- Auto-dismiss with configurable timeout
- Built on Zendesk Garden `useToast` hook
- Custom notification dispatch system

#### Usage
```typescript
import { addFlashNotification } from "flash-notifications";

addFlashNotification({
  type: "success",
  message: "Request submitted successfully!",
});
```

---

### 3. Category Accordions Module
**Location**: `src/modules/category-accordions/`

Collapsible category listings for help center navigation.

#### Features
- Lightweight vanilla JS implementation
- No dependencies
- Keyboard accessible (ARIA compliant)
- Smooth animations

---

### 4. Dropdown Component (Vanilla JS)
**Location**: `src/Dropdown.js:1`

Custom accessible dropdown implementation with **zero dependencies**.

#### Features
- Full keyboard navigation (Arrow keys, Home/End, Tab, Escape)
- Type-to-find functionality
- ARIA attributes for accessibility
- Comprehensive test suite (`Dropdown.spec.js:1`)

#### API
```javascript
const dropdown = new Dropdown(element);
dropdown.open();
dropdown.close();
dropdown.toggle();
```

---

### 5. Navigation System
**Location**: `src/navigation.js:1`, `src/modules/mobile-navigation.jsx`

Handles mobile & desktop navigation with animations.

#### Features
- Mobile menu toggle with slide animation
- Responsive breakpoint handling
- Back-to-top button
- Search focus management

---

### 6. Search Functionality
**Location**: `src/search.js:1`, `templates/search_results.hbs`

Instant search and search results page.

#### Features
- Instant search (type-ahead)
- Scoped search (filter by category/section)
- Search highlighting
- Pagination

---

### 7. Shared Utilities Module
**Location**: `src/modules/shared/`

Provides common functionality for React modules.

#### Submodules
- **i18n/**: Initialize i18next and load translations dynamically
  - `loadTranslations.ts:1` - Dynamic translation imports
  - `initI18next.ts:1` - i18next configuration
- **garden-theme/**: Create Zendesk Garden theme from manifest
  - `createTheme.ts:1` - Theme factory
- **notifications/**: Flash notification dispatch
  - `useFlashNotification.tsx:1` - Custom hook

---

## Development Workflow

### Setup

```bash
# Install Node 18.12.1
nvm use

# Install dependencies
yarn install
```

### Development Commands

```bash
# Start development servers (Rollup + Tailwind + ZCLI preview)
yarn start

# Build for production
yarn build

# Run tests
yarn test

# Run accessibility audits
yarn test-a11y

# Lint code
yarn eslint

# Format code
yarn prettier

# Extract i18n strings
yarn i18n:extract

# Download translations from Zendesk
yarn i18n:update-translations

# Preview theme locally
yarn zcli themes:preview

# Upload theme to Zendesk
yarn zcli themes:upload
```

### Development Server Details

When running `yarn start`, three processes run concurrently:

1. **Rollup Watcher**: Rebuilds JS bundles on file changes
2. **Tailwind Watcher**: Recompiles Tailwind CSS
3. **ZCLI Preview**: Local theme preview server

The preview server runs at `http://localhost:4567` (or similar).

---

## Build System

### Rollup Configuration
**Location**: `rollup.config.mjs:1`

#### Two Bundling Strategies

##### 1. Main Script Bundle (IIFE)
- **Entry**: `src/index.js:1`
- **Output**: `assets/script.js`
- **Format**: IIFE (Immediately Invoked Function Expression)
- **Purpose**: Core vanilla JS functionality
- **Plugins**: Node resolve, CommonJS, Babel

##### 2. React Modules (ES Modules)
- **Entries**: Multiple module entry points
  - `new-request-form`
  - `flash-notifications`
  - `category-accordions`
- **Output**: Individual ES module bundles
  - `new-request-form-bundle.js`
  - `flash-notifications-bundle.js`
  - `shared-bundle.js` (shared dependencies)
  - `*-translations-bundle.js` (per-language)
- **Format**: ES modules with import maps
- **Code Splitting**: Shared dependencies extracted
- **External**: `@zendesk/help-center-wysiwyg` (loaded separately)

#### Import Map Generation
**Location**: `rollup-plugins/generate-import-map.mjs`

Custom Rollup plugin that:
1. Analyzes bundle chunks
2. Creates import maps for module resolution
3. Injects into `templates/document_head.hbs:1`

Example import map:
```html
<script type="importmap">
{
  "imports": {
    "new-request-form": "{{asset 'new-request-form-bundle.js'}}",
    "shared": "{{asset 'shared-bundle.js'}}",
    "react": "{{asset 'react-bundle.js'}}"
  }
}
</script>
```

---

## Styling System

### Three-Tier Styling Approach

#### 1. SCSS (Structural Styles)
**Location**: `styles/*.scss`
**Entry**: `styles/index.scss:1`
**Output**: `assets/style.css`

**28 SCSS partials** covering:
- Variables & mixins (`_variables.scss:1`)
- Typography (`_typography.scss:1`)
- Layout (header, footer, hero)
- Components (buttons, forms, notifications)
- Pages (article, search, community)

**ZASS Plugin** (`rollup-plugins/zass.mjs`):
- Converts `manifest.json` settings to Sass variables
- Enables theme customization via Zendesk UI
- Functions: `zass-lighten`, `zass-darken`

#### 2. Tailwind CSS (Utility Classes)
**Location**: `styles/input.css:1`
**Output**: `assets/output.css`

Tailwind configuration with custom theme:
- Brand colors from manifest
- Custom spacing scale
- Responsive breakpoints
- JIT compilation in dev mode
- PurgeCSS in production

#### 3. Styled Components (React Components)
**Location**: Within React components

CSS-in-JS for React modules using `styled-components`:
- Component-scoped styles
- Dynamic theming via props
- TypeScript type safety

---

## Internationalization

### i18n Architecture

#### Translation Files
- **Source**: `src/modules/*/translations/en-us.yml`
- **Output**: `src/modules/*/translations/locales/*.json`
- **Languages**: 20+ supported languages

#### Translation Workflow

1. **Extract Strings**: `bin/extract-strings.mjs`
   - Parses source files for `t()` calls
   - Generates YAML files with keys

2. **Download Translations**: `bin/update-translations.js`
   - Fetches translated strings from Zendesk API
   - Converts to JSON format

3. **Bundle Translations**: During Rollup build
   - Creates per-language bundles
   - Example: `new-request-form-en-translations-bundle.js`

4. **Runtime Loading**: `src/modules/shared/i18n/loadTranslations.ts:1`
   - Dynamic imports based on user locale
   - Fallback to English

#### Usage in Components
```typescript
import { useTranslation } from "react-i18next";

export const MyComponent = () => {
  const { t } = useTranslation();

  return <button>{t("submit_button")}</button>;
};
```

#### Translation Key Format
```yaml
# en-us.yml
submit_button: "Submit Request"
field_required: "This field is required"
error_network: "Network error. Please try again."
```

---

## Testing

### Unit Tests (Jest)
**Location**: `*.spec.js` files
**Config**: `jest.config.mjs:1`

#### Test Setup
- **Environment**: jsdom
- **Transform**: ts-jest for TypeScript
- **Preset**: rollup-jest
- **Setup**: `@testing-library/jest-dom`

#### Example Test
```javascript
// src/Dropdown.spec.js
import Dropdown from "./Dropdown";

describe("Dropdown", () => {
  it("opens menu on trigger click", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div class="dropdown">
        <button class="dropdown-toggle">Menu</button>
        <ul class="dropdown-menu"></ul>
      </div>
    `;

    const dropdown = new Dropdown(container.querySelector(".dropdown"));
    dropdown.open();

    expect(container.querySelector(".dropdown-menu")).toHaveAttribute("aria-expanded", "true");
  });
});
```

### Accessibility Testing (Lighthouse)
**Location**: `bin/lighthouse/`

#### Automated Audits
```bash
yarn test-a11y
```

Runs Lighthouse audits on:
- Homepage
- Article pages
- Search results
- Request forms

**Config** (`bin/lighthouse/config.js:1`):
- Performance thresholds
- Accessibility score requirements (90+)
- SEO checks
- Best practices validation

---

## Deployment

### Manifest Configuration
**Location**: `manifest.json:1`

Defines theme settings exposed in Zendesk Theming Center UI:

#### Color Settings
- Brand color
- Text color (light/dark)
- Link color
- Background colors

#### Typography
- Heading font (dropdown selection)
- Body font (dropdown selection)

#### Branding
- Logo URL
- Favicon URL
- Brand name toggle

#### Feature Flags
- Instant search
- Scoped search
- Recent activity
- Article sharing
- Community features

#### Images
- Homepage background
- Community backgrounds
- Open graph image

### Release Process

#### Semantic Release
**Location**: `.releaserc:1`

Automated release pipeline:
1. Commit analysis (conventional commits)
2. Version determination (major/minor/patch)
3. Manifest version update
4. Asset compilation
5. Git commit & tag
6. GitHub release creation
7. Changelog generation

#### Commit Convention
```bash
feat: add new field type to request form    # Minor version bump
fix: correct dropdown keyboard navigation   # Patch version bump
BREAKING CHANGE: remove legacy API          # Major version bump
```

### Deployment to Zendesk

#### Manual Upload
```bash
yarn zcli themes:upload
```

#### GitHub Integration
- Push to master branch
- Zendesk syncs from GitHub
- Theme updates automatically

---

## Planned Improvements

### 1. Performance Optimization

#### Problem
Current bundle sizes are large, impacting initial load time:
- `script.js`: ~100KB minified
- `output.css` (Tailwind): ~200KB (needs purging optimization)
- Multiple React module bundles load synchronously

#### Proposed Solutions
- **Lazy load React modules**: Only load when needed
  - Load flash-notifications on demand
  - Defer category-accordions until scrolled into view
- **Tree shake Tailwind more aggressively**: Review PurgeCSS configuration
- **Implement code splitting**: Break large modules into smaller chunks
  - Split new-request-form by field type
  - Load answer-bot-modal on interaction
- **Optimize SVG assets**: Use sprite sheets instead of individual files
- **Enable HTTP/2 push**: Preload critical assets
- **Implement service worker**: Cache static assets for repeat visits

**Priority**: High
**Estimated Impact**: 30-50% reduction in initial load time
**Files to Modify**:
- `rollup.config.mjs:1` - Add dynamic imports
- `tailwind.config.js` - Optimize purge settings
- `templates/document_head.hbs:1` - Add resource hints

---

### 2. TypeScript Migration

#### Problem
- Only React modules use TypeScript
- Vanilla JS files lack type safety
- Prone to runtime errors in navigation.js, forms.js, etc.

#### Proposed Solutions
- **Migrate vanilla JS to TypeScript**:
  - Start with `Dropdown.js` → `Dropdown.ts`
  - Convert utilities: `navigation.js`, `forms.js`, `search.js`
- **Add JSDoc type annotations** as interim step
- **Create shared type definitions**: `types/zendesk.d.ts` for Zendesk globals
- **Enable strict mode** for all TypeScript files

**Priority**: Medium
**Estimated Impact**: Reduce runtime errors, improve DX
**Files to Migrate**:
- `src/Dropdown.js:1`
- `src/navigation.js:1`
- `src/forms.js:1`
- `src/search.js:1`

---

### 3. React 18 Upgrade

#### Problem
- Using React 17.0.2 (released 2020)
- Missing new features: Concurrent rendering, Suspense improvements, Transitions
- Future security & compatibility concerns

#### Proposed Solutions
- **Upgrade to React 18.3+**
  - Update `package.json` dependencies
  - Replace `ReactDOM.render` with `createRoot` (already done!)
  - Test all modules for compatibility
- **Adopt new React 18 features**:
  - Use `Suspense` for lazy-loaded translations
  - Implement `useTransition` for heavy form operations
  - Utilize `useDeferredValue` for search suggestions
- **Update testing library**: Upgrade to latest `@testing-library/react`

**Priority**: Medium
**Estimated Impact**: Future-proofing, potential performance gains
**Files to Modify**:
- `package.json:1` - Dependency versions
- `src/modules/*/render*.tsx` - Already using createRoot
- Test files - Update assertions

---

### 4. Accessibility Enhancements

#### Problem
- Manual testing required for keyboard navigation
- Screen reader testing not automated
- Some color contrast issues in custom theme variants

#### Proposed Solutions
- **Automated accessibility testing in CI**:
  - Add `jest-axe` for component-level testing
  - Expand Lighthouse audit coverage
  - Run tests on all page templates
- **Improve keyboard navigation**:
  - Add skip links for all pages
  - Ensure focus indicators meet WCAG 2.1 standards
  - Test with keyboard-only navigation
- **Screen reader optimization**:
  - Add ARIA live regions for dynamic content
  - Improve label associations
  - Test with NVDA, JAWS, VoiceOver
- **Color contrast validation**:
  - Add contrast checker to build process
  - Validate all manifest color combinations

**Priority**: High
**Estimated Impact**: WCAG 2.1 AAA compliance
**Files to Modify**:
- `jest.config.mjs:1` - Add jest-axe setup
- `bin/lighthouse/config.js:1` - Expand page coverage
- `templates/*.hbs` - Add skip links
- `styles/_variables.scss:1` - Document contrast ratios

---

### 5. Improved Developer Experience

#### Problem
- Slow rebuild times during development
- Limited error messages in Handlebars templates
- No hot module replacement (HMR)
- Manual translation updates

#### Proposed Solutions
- **Implement HMR for React modules**:
  - Add Rollup HMR plugin
  - Enable fast refresh for components
- **Improve build performance**:
  - Use SWC instead of Babel (10x faster)
  - Enable Rollup caching
  - Parallelize Tailwind compilation
- **Better error handling**:
  - Add source maps for production builds (optional)
  - Improve error boundaries in React modules
  - Add detailed logging in build scripts
- **Automate translation workflow**:
  - GitHub Actions to pull translations nightly
  - Auto-create PRs for translation updates
- **Add Storybook**:
  - Component documentation
  - Visual testing
  - Design system showcase

**Priority**: Medium
**Estimated Impact**: 50% faster rebuild times, better DX
**Files to Modify**:
- `rollup.config.mjs:1` - Add HMR plugin, switch to SWC
- `.github/workflows/` - Add translation automation
- Add `storybook/` directory

---

### 6. Testing Coverage Expansion

#### Problem
- Only `Dropdown.js` has comprehensive tests
- React modules lack test coverage
- No integration tests for template-module interaction

#### Proposed Solutions
- **Add unit tests for all modules**:
  - `NewRequestForm` component tests
  - Field validation tests
  - Form submission flow tests
- **Integration tests**:
  - Test template → React module data flow
  - Test i18n loading
  - Test theme customization
- **Visual regression testing**:
  - Add Percy or Chromatic
  - Screenshot all page templates
  - Detect unintended UI changes
- **Set coverage thresholds**:
  - 80% statement coverage
  - 70% branch coverage
  - Block PRs below thresholds

**Priority**: High
**Estimated Impact**: Reduce production bugs
**Files to Create**:
- `src/modules/new-request-form/__tests__/`
- `src/modules/flash-notifications/__tests__/`
- `jest.config.mjs:1` - Add coverage thresholds

---

### 7. Bundle Analysis & Monitoring

#### Problem
- No visibility into bundle composition
- Unknown which dependencies are largest
- Can't track bundle size over time

#### Proposed Solutions
- **Add bundle analyzer**:
  - `rollup-plugin-visualizer` for treemap visualization
  - Generate reports on each build
- **Bundle size monitoring**:
  - Track bundle sizes in CI
  - Fail builds if bundles exceed thresholds
  - Add size-limit package
- **Dependency auditing**:
  - Regular `yarn audit`
  - Depcheck for unused dependencies
  - Renovate bot for automated updates

**Priority**: Low
**Estimated Impact**: Better bundle optimization decisions
**Files to Modify**:
- `rollup.config.mjs:1` - Add visualizer plugin
- `package.json:1` - Add size-limit script
- `.github/workflows/` - Add size tracking

---

### 8. Modernize Build Pipeline

#### Problem
- Using Rollup 3 (Rollup 4 available)
- Babel still used (SWC is faster)
- Manual asset optimization

#### Proposed Solutions
- **Upgrade to Rollup 4**:
  - Better tree-shaking
  - Improved code splitting
  - Faster builds
- **Replace Babel with SWC**:
  - 10-20x faster transpilation
  - Drop-in replacement for JSX
  - Native TypeScript support
- **Automate asset optimization**:
  - Sharp for image optimization
  - SVGO for SVG minification
  - Font subsetting for web fonts

**Priority**: Low
**Estimated Impact**: 2-3x faster builds
**Files to Modify**:
- `package.json:1` - Update dependencies
- `rollup.config.mjs:1` - Replace Babel with SWC
- `bin/` - Add asset optimization scripts

---

### 9. Error Tracking & Monitoring

#### Problem
- No visibility into production errors
- Client-side errors go unreported
- Difficult to debug user-reported issues

#### Proposed Solutions
- **Integrate error tracking**:
  - Add Sentry or similar service
  - Track JavaScript errors
  - Monitor failed API calls
- **Add performance monitoring**:
  - Real User Monitoring (RUM)
  - Track Core Web Vitals
  - Monitor bundle load times
- **User feedback loop**:
  - Add feedback widget
  - Track feature usage
  - A/B testing framework

**Priority**: Medium
**Estimated Impact**: Proactive bug detection
**Implementation Notes**:
- Ensure GDPR compliance
- Add privacy policy disclosure
- Make opt-out available

---

### 10. Documentation Improvements

#### Problem
- Limited inline code documentation
- No API documentation for modules
- Setup instructions scattered

#### Proposed Solutions
- **Add JSDoc/TSDoc comments**:
  - Document all public APIs
  - Add usage examples
  - Generate API docs with TypeDoc
- **Create architecture diagrams**:
  - Visual data flow diagrams
  - Component hierarchy
  - Build pipeline flowchart
- **Improve README**:
  - Add troubleshooting section
  - Common gotchas
  - Contributing guidelines
- **Video tutorials**:
  - Setup walkthrough
  - Creating custom fields
  - Theme customization

**Priority**: Low
**Estimated Impact**: Easier onboarding for new developers
**Files to Create**:
- `docs/` directory with diagrams
- `CONTRIBUTING.md`
- `TROUBLESHOOTING.md`

---

## Implementation Roadmap

### Phase 1: Foundation (Q1)
- [ ] Accessibility enhancements (#4)
- [ ] Testing coverage expansion (#6)
- [ ] Performance optimization - low-hanging fruit (#1)

### Phase 2: Modernization (Q2)
- [ ] React 18 upgrade (#3)
- [ ] TypeScript migration - utilities (#2)
- [ ] Bundle analysis setup (#7)

### Phase 3: DX & Tooling (Q3)
- [ ] Improved developer experience (#5)
- [ ] Error tracking integration (#9)
- [ ] Modernize build pipeline (#8)

### Phase 4: Polish (Q4)
- [ ] Documentation improvements (#10)
- [ ] Visual regression testing
- [ ] Performance optimization - advanced techniques

---

## Contributing

### Code Style
- Follow ESLint rules (`.eslintrc.js:1`)
- Use Prettier for formatting
- Follow conventional commits

### Testing Requirements
- Add tests for new features
- Maintain test coverage
- Run `yarn test` before committing

### Pull Request Process
1. Create feature branch from `master`
2. Make changes with tests
3. Run linting & tests
4. Commit with conventional format
5. Open PR with description
6. Wait for CI checks
7. Address review comments
8. Merge when approved

---

## Resources

### Key Documentation
- **Zendesk Theming**: https://support.zendesk.com/hc/en-us/articles/4408843597850
- **Zendesk Garden**: https://garden.zendesk.com/
- **ZCLI**: https://developer.zendesk.com/documentation/apps/app-developer-guide/zcli/
- **Curlybars**: https://github.com/zendesk/curlybars

### Internal References
- `README.md:1` - Project overview
- `CHANGELOG.md:1` - Version history
- `manifest.json:1` - Theme configuration
- `package.json:1` - Dependencies & scripts

---

**Last Updated**: 2025-10-23
**Maintainer**: Vagaro Development Team
**Questions?** Open an issue or contact the team.
