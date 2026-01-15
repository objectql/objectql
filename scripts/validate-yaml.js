#!/usr/bin/env node
/**
 * Validate YAML syntax for ObjectQL metadata files
 * 
 * This script validates all metadata files in the repository:
 * - *.object.yml
 * - *.validation.yml
 * - *.permission.yml
 * - *.app.yml
 * - *.page.yml
 * - *.menu.yml
 */

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Define metadata file extensions
const extensions = [
  '.object.yml',
  '.validation.yml',
  '.permission.yml',
  '.app.yml',
  '.page.yml',
  '.menu.yml'
];

// Directories to exclude
const excludeDirs = ['node_modules', 'dist', '.git'];

/**
 * Recursively find all files matching the specified extensions
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (!excludeDirs.includes(file)) {
        findFiles(filePath, fileList);
      }
    } else {
      // Check if file matches any of our extensions
      if (extensions.some(ext => file.endsWith(ext))) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

let hasErrors = false;
let validCount = 0;
let errorCount = 0;

console.log('🔍 Validating ObjectQL metadata YAML files...\n');

// Find and validate all metadata files
const files = findFiles(process.cwd());

if (files.length === 0) {
  console.log('ℹ️  No metadata files found to validate.');
  process.exit(0);
}

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    yaml.load(content);
    console.log(`✓ ${path.relative(process.cwd(), file)}`);
    validCount++;
  } catch (error) {
    console.error(`✗ ${path.relative(process.cwd(), file)}`);
    console.error(`  Error: ${error.message}`);
    if (error.mark) {
      console.error(`  Line ${error.mark.line + 1}, Column ${error.mark.column + 1}`);
    }
    console.error('');
    hasErrors = true;
    errorCount++;
  }
});

// Print summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error(`❌ Validation failed: ${errorCount} error(s) found`);
  console.log(`✓ Valid files: ${validCount}`);
  console.error(`✗ Invalid files: ${errorCount}`);
  process.exit(1);
} else {
  console.log(`✅ All ${validCount} YAML metadata file(s) are valid!`);
  process.exit(0);
}
