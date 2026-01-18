/**
 * Script to add MIT license headers to all source code files
 * 
 * This script:
 * 1. Recursively finds all .ts, .js, .tsx, .jsx, .vue files
 * 2. Excludes node_modules, dist, build, .git, coverage directories
 * 3. Checks if file already has copyright/license (skips if found)
 * 4. Adds MIT license header at the top of the file
 */

const fs = require('fs');
const path = require('path');

// MIT License header template
const LICENSE_HEADER = `/**
 * ObjectQL
 * Copyright (c) 2024-present ObjectStack Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

`;

// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage'];

// File extensions to process
const TARGET_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx', '.vue'];

/**
 * Check if directory should be excluded
 */
function shouldExcludeDir(dirPath) {
  const dirName = path.basename(dirPath);
  return EXCLUDE_DIRS.includes(dirName);
}

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return TARGET_EXTENSIONS.includes(ext);
}

/**
 * Check if file already has copyright or license in first 10 lines
 */
function hasExistingLicense(content) {
  const lines = content.split('\n').slice(0, 10);
  const firstTenLines = lines.join('\n').toLowerCase();
  return firstTenLines.includes('copyright') || firstTenLines.includes('license');
}

/**
 * Recursively find all files in directory
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldExcludeDir(filePath)) {
        findFiles(filePath, fileList);
      }
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Add license header to file
 */
function addLicenseHeader(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if already has license
    if (hasExistingLicense(content)) {
      console.log(`⏭️  Skipped (already has license): ${filePath}`);
      return false;
    }

    // Check if file starts with shebang
    let newContent;
    if (content.startsWith('#!')) {
      // Extract shebang line
      const firstNewline = content.indexOf('\n');
      const shebang = content.substring(0, firstNewline + 1);
      const rest = content.substring(firstNewline + 1);
      
      // Put shebang first, then license, then rest
      newContent = shebang + LICENSE_HEADER + rest;
    } else {
      // Add license header at the beginning
      newContent = LICENSE_HEADER + content;
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Added license header: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  const rootDir = path.resolve(__dirname, '..');
  console.log(`🔍 Scanning directory: ${rootDir}\n`);

  // Find all target files
  const files = findFiles(rootDir);
  console.log(`📁 Found ${files.length} files to process\n`);

  // Process each file
  let addedCount = 0;
  let skippedCount = 0;

  files.forEach(file => {
    if (addLicenseHeader(file)) {
      addedCount++;
    } else {
      skippedCount++;
    }
  });

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Summary:`);
  console.log(`   Total files found: ${files.length}`);
  console.log(`   ✅ Headers added: ${addedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`${'='.repeat(60)}\n`);
}

// Run the script
main();
