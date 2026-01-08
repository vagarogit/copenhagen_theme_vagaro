# Version Management

This project includes automated version management for both `package.json` and `manifest.json`.

## Quick Start

### Option 1: Build with Auto Version Bump

```bash
# Bump patch version (e.g., 4.0.70 → 4.0.71) and build
yarn build:release

# Bump minor version (e.g., 4.0.70 → 4.1.0) and build
yarn build:minor

# Bump major version (e.g., 4.0.70 → 5.0.0) and build
yarn build:major
```

### Option 2: Manual Version Bump Only

```bash
# Bump patch version only (no build)
yarn version:patch

# Bump minor version only (no build)
yarn version:minor

# Bump major version only (no build)
yarn version:major
```

### Option 3: Build Without Version Change

```bash
# Regular build without version bump (for development)
yarn build
```

## Version Bump Script

The version bump script is located at `bin/version-bump.js` and can also be run directly:

```bash
node bin/version-bump.js [patch|minor|major]
```

## Semantic Versioning

The project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (4.X.0): New features, backwards compatible
- **PATCH** (4.0.X): Bug fixes and minor updates

## What Gets Updated

When you run any version bump command, both files are updated simultaneously:
- `package.json` → version field
- `manifest.json` → version field

Both files will always have matching version numbers.

## Workflow Examples

### Development Workflow
```bash
# Make your changes...
git add .
git commit -m "feat: add new feature"

# Build for release with automatic version bump
yarn build:release

# Commit the version changes
git add package.json manifest.json
git commit -m "chore: bump version to $(node -p "require('./package.json').version")"
git push
```

### Manual Control
```bash
# Bump version first
yarn version:patch

# Make additional changes if needed
# ...

# Build when ready
yarn build
```

