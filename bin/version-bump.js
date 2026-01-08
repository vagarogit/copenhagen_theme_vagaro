#!/usr/bin/env node

/**
 * Auto-increment version in both package.json and manifest.json
 * 
 * Usage:
 *   node bin/version-bump.js [patch|minor|major]
 * 
 * Defaults to 'patch' if no argument provided
 */

const fs = require('fs');
const path = require('path');

// Get the bump type from command line args (default to 'patch')
const bumpType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error(`Invalid bump type: ${bumpType}. Must be one of: patch, minor, major`);
  process.exit(1);
}

// File paths
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const manifestJsonPath = path.join(__dirname, '..', 'manifest.json');

/**
 * Increment a semantic version string
 * @param {string} version - Current version (e.g., "4.0.69")
 * @param {string} type - Type of bump ('patch', 'minor', 'major')
 * @returns {string} New version
 */
function incrementVersion(version, type) {
  const parts = version.split('.').map(Number);
  
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  let [major, minor, patch] = parts;
  
  switch (type) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
    default:
      patch++;
      break;
  }
  
  return `${major}.${minor}.${patch}`;
}

/**
 * Update version in a JSON file
 * @param {string} filePath - Path to JSON file
 * @param {string} newVersion - New version string
 */
function updateJsonFile(filePath, newVersion) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    const oldVersion = json.version;
    
    json.version = newVersion;
    
    // Write back with proper formatting (2 spaces indentation)
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    
    console.log(`✓ Updated ${path.basename(filePath)}: ${oldVersion} → ${newVersion}`);
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Main execution
try {
  // Read current version from package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  
  // Calculate new version
  const newVersion = incrementVersion(currentVersion, bumpType);
  
  console.log(`\nBumping ${bumpType} version: ${currentVersion} → ${newVersion}\n`);
  
  // Update both files
  updateJsonFile(packageJsonPath, newVersion);
  updateJsonFile(manifestJsonPath, newVersion);
  
  console.log('\n✓ Version bump completed successfully!\n');
} catch (error) {
  console.error('\n✗ Version bump failed:', error.message, '\n');
  process.exit(1);
}

