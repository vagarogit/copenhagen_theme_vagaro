# Release Tips & Best Practices

## ⚠️ Critical: Always Build for Production Before Committing

### The Problem
Zendesk themes have an **800KB size limit**. Development builds create unminified code that can exceed this limit (script.js alone can be 1.2MB unminified vs 218KB minified).

### The Solution
**ALWAYS run a production build before committing and pushing to GitHub:**

```bash
yarn build
# or
NODE_ENV=production yarn build
```

This command:
- Minifies all JavaScript files (script.js and asset bundles)
- Removes console.log statements
- Optimizes the bundle size
- Ensures theme stays under 800KB limit

## Recommended Workflow

### Development
```bash
# Start development server with watch mode
yarn start

# Make your changes...
# Test locally...
```

### Before Committing
```bash
# 1. Build for production (REQUIRED)
yarn build

# 2. Check file sizes (optional but recommended)
ls -lh script.js assets/*-bundle.js

# 3. Commit your changes
git add .
git commit -m "your commit message"

# 4. Push to GitHub
git push
```

## File Size Reference

### Expected File Sizes After Production Build:
- `script.js`: ~218KB (minified)
- `style.css`: ~153KB
- `assets/output.css`: ~57KB
- Asset bundles: Various sizes, all minified

### Warning Signs:
- ❌ `script.js` > 500KB = likely unminified, run `yarn build`
- ❌ `script.js` has 36,000+ lines = definitely unminified
- ✅ `script.js` is ~26 lines and ~218KB = properly minified

## Quick Size Check

```bash
# Check script.js size
ls -lh script.js

# Count lines (should be ~26 for minified)
wc -l script.js

# Check all bundle sizes
du -sh script.js assets/*-bundle.js style.css
```

## What Gets Excluded from Zendesk Sync

The `.zcliignore` file excludes:
- `node_modules/`
- `src/` (source files)
- `bin/` (build scripts)
- Development config files
- Non-English translation bundles (to save space)
- README, documentation files

## Troubleshooting

### "Theme exceeds 800KB" error
**Solution:** You committed unminified code. Run:
```bash
yarn build
git add script.js assets/*-bundle.js
git commit -m "chore: rebuild with production minification"
git push
```

### How to verify minification worked
```bash
# Should show ~218K
ls -lh script.js

# Should show ~26 lines
wc -l script.js

# Should NOT contain readable code
head -5 script.js
```

## Build Scripts Reference

From `package.json`:

- `yarn start` - Development mode with watch (unminified)
- `yarn build` - Production build (minified) - **USE THIS BEFORE COMMITS**
- `yarn test` - Run tests
- `yarn eslint` - Lint code

## Pre-commit Hook (Optional)

To automatically build for production before every commit, you can add a git hook. However, this may slow down commits. Consider whether you prefer:

1. **Manual approach** (current): Remember to run `yarn build` before committing
2. **Automated approach**: Hook runs `yarn build` automatically (slower commits)

## Common Mistakes to Avoid

1. ❌ Committing after `yarn start` without running `yarn build`
2. ❌ Testing locally with dev build, then syncing to Zendesk
3. ❌ Forgetting to check file sizes before pushing
4. ❌ Not reading error messages from Zendesk sync

## Zendesk Theme Upload Process

After pushing to GitHub:
1. GitHub Actions or manual sync triggers
2. Zendesk downloads the theme
3. Size is checked against 800KB limit
4. If exceeds → **Error: Theme exceeds 800KB**
5. If passes → Theme is imported successfully

## Remember

**Always build for production before committing:**
```bash
yarn build && git add . && git commit -m "your message" && git push
```

Or create an alias in your `.zshrc`:
```bash
alias release="yarn build && git add . && git status"
```

## Theme Thumbnail Customization

### Making Your Theme Stand Out

The `thumbnail.png` file in the root directory is what appears in the Zendesk theme library. Customize it to make your theme easily identifiable.

**Thumbnail Specifications:**
- **File:** `thumbnail.png` (root directory)
- **Dimensions:** 1280x800 pixels (16:10 aspect ratio) recommended
- **Format:** PNG or JPG
- **File size:** Keep under 200KB
- **Design tips:**
  - Use your brand colors (Vagaro: #D43C2E red, #17494D teal)
  - Include your logo or brand elements
  - Make it visually distinct from default Copenhagen themes
  - Ensure text is readable at thumbnail size

**To Update Thumbnail:**
```bash
# 1. Replace thumbnail.png with your custom artwork
# 2. Optimize image size if needed
# 3. Commit the change
git add thumbnail.png
git commit -m "chore: update theme thumbnail artwork"
git push
```

**Current thumbnail location:**
```
thumbnail.png (48KB)
```

