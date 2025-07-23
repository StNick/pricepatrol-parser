#!/usr/bin/env node

/**
 * Release Script for @pricepatrol/parser
 * 
 * Automates the release process:
 * 1. Validates working directory is clean
 * 2. Runs tests and build
 * 3. Updates version
 * 4. Updates changelog
 * 5. Creates git tag
 * 6. Pushes to GitHub (triggers automated NPM publish)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VALID_RELEASE_TYPES = ['patch', 'minor', 'major'];

function execCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completed`);
    return output.trim();
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    process.exit(1);
  }
}

function validateWorkingDirectory() {
  const status = execCommand('git status --porcelain', 'Checking working directory');
  if (status) {
    console.error('❌ Working directory is not clean. Please commit or stash changes.');
    console.log('Uncommitted changes:');
    console.log(status);
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function updateVersion(releaseType) {
  console.log(`🔄 Updating version (${releaseType})...`);
  const output = execCommand(`npm version ${releaseType} --no-git-tag-version`, 'Version update');
  const newVersion = getCurrentVersion();
  console.log(`✅ Version updated to ${newVersion}`);
  return newVersion;
}

function updateChangelog(version) {
  const changelogPath = 'CHANGELOG.md';
  if (!fs.existsSync(changelogPath)) {
    console.log('📝 Creating initial CHANGELOG.md');
    const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [${version}] - ${new Date().toISOString().split('T')[0]}

### Added
- Release ${version}

[Unreleased]: https://github.com/pricepatrol/parser/compare/v${version}...HEAD
[${version}]: https://github.com/pricepatrol/parser/releases/tag/v${version}
`;
    fs.writeFileSync(changelogPath, initialChangelog);
    return;
  }

  let changelog = fs.readFileSync(changelogPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  
  // Replace [Unreleased] with current version
  changelog = changelog.replace(
    /## \[Unreleased\]/,
    `## [Unreleased]\n\n## [${version}] - ${today}`
  );
  
  // Update the links at the bottom
  const unreleasedLink = `[Unreleased]: https://github.com/StNick/pricepatrol-parser/compare/v${version}...HEAD`;
  const versionLink = `[${version}]: https://github.com/StNick/pricepatrol-parser/releases/tag/v${version}`;
  
  if (changelog.includes('[Unreleased]:')) {
    changelog = changelog.replace(
      /\[Unreleased\]: .*/,
      `${unreleasedLink}\n${versionLink}`
    );
  } else {
    changelog += `\n${unreleasedLink}\n${versionLink}\n`;
  }
  
  fs.writeFileSync(changelogPath, changelog);
  console.log(`✅ Updated CHANGELOG.md for version ${version}`);
}

function createGitTag(version) {
  execCommand('git add .', 'Staging changes');
  execCommand(`git commit -m "chore: release v${version}"`, 'Committing changes');
  execCommand(`git tag -a v${version} -m "Release v${version}"`, 'Creating git tag');
  console.log(`✅ Created git tag v${version}`);
}

function pushToGitHub() {
  execCommand('git push origin main', 'Pushing commits to GitHub');
  execCommand('git push origin --tags', 'Pushing tags to GitHub');
  console.log('✅ Pushed to GitHub - CI/CD will handle NPM publishing');
}

function main() {
  const releaseType = process.argv[2];
  
  if (!releaseType || !VALID_RELEASE_TYPES.includes(releaseType)) {
    console.log('Usage: npm run release <patch|minor|major>');
    console.log('');
    console.log('Examples:');
    console.log('  npm run release patch   # 1.0.0 -> 1.0.1');
    console.log('  npm run release minor   # 1.0.0 -> 1.1.0');
    console.log('  npm run release major   # 1.0.0 -> 2.0.0');
    process.exit(1);
  }

  console.log(`🚀 Starting ${releaseType} release process...\n`);

  // Pre-release checks
  validateWorkingDirectory();
  
  // Run tests and build
  execCommand('npm run lint', 'Running linter');
  execCommand('npm run test:run', 'Running tests');
  execCommand('npm run build', 'Building package');
  
  // Update version and changelog
  const currentVersion = getCurrentVersion();
  console.log(`📦 Current version: ${currentVersion}`);
  
  const newVersion = updateVersion(releaseType);
  updateChangelog(newVersion);
  
  // Create release
  createGitTag(newVersion);
  pushToGitHub();
  
  console.log(`\n🎉 Release v${newVersion} completed successfully!`);
  console.log(`📦 NPM package will be published automatically by GitHub Actions`);
  console.log(`🔗 Monitor progress at: https://github.com/StNick/pricepatrol-parser/actions`);
}

if (require.main === module) {
  main();
}