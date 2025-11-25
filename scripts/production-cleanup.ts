#!/usr/bin/env ts-node
/**
 * Production Cleanup Script
 * 
 * This script removes test data and unnecessary files to prepare for production deployment
 * 
 * Usage:
 *   npm run cleanup-production [--dry-run] [--verbose]
 *   
 * Options:
 *   --dry-run   Show what would be removed without actually removing it
 *   --verbose   Show detailed information about each operation
 * 
 * Example:
 *   npm run cleanup-production --dry-run
 *   npm run cleanup-production
 */

import * as fs from 'fs';
import * as path from 'path';

interface CleanupReport {
  filesRemoved: string[];
  filesPreserved: string[];
  errors: string[];
  summary: string;
}

const ROOT_DIR = process.cwd();

// Files to remove from root directory (except README.md)
const ROOT_MARKDOWN_PATTERNS = [
  'ADMIN-*.md',
  'CAMPAIGN-*.md',
  'DEPLOYMENT-*.md',
  'FIREBASE-*.md',
  'FREE-CAMPAIGN-*.md',
  'MOBILE-*.md',
  'MONITORING-*.md',
  'PAYMENT-*.md',
  'PRE-DEPLOYMENT-*.md',
  'PRODUCTION-*.md',
  'QUICK-*.md',
  'RESPONSIVE-*.md',
  'SECURITY-*.md',
  'SEO-*.md',
  'TASK-*.md',
  'TROUBLESHOOTING.md',
  'VERCEL-*.md',
  '*-COMPLETE.md',
  '*-SUMMARY.md',
  '*-STATUS.md',
  '*-PROGRESS.md',
  '*-GUIDE.md',
  '*-REFERENCE.txt',
  '*-CHECKLIST.md',
  '*-NOTES.md',
];

// Essential files to preserve
const PRESERVE_FILES = [
  'README.md',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  '.gitignore',
  '.env.example',
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json',
  'storage.rules',
];

// Directories to preserve
const PRESERVE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'app',
  'components',
  'lib',
  'public',
  'scripts',
  'functions',
  'docs', // Keep essential documentation
  '.kiro',
];

function matchesPattern(filename: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(filename);
  });
}

function getFilesToRemove(): string[] {
  const files: string[] = [];
  
  try {
    const rootFiles = fs.readdirSync(ROOT_DIR);
    
    for (const file of rootFiles) {
      const filePath = path.join(ROOT_DIR, file);
      const stat = fs.statSync(filePath);
      
      // Skip directories
      if (stat.isDirectory()) {
        continue;
      }
      
      // Skip preserved files
      if (PRESERVE_FILES.includes(file)) {
        continue;
      }
      
      // Check if file matches removal patterns
      if (matchesPattern(file, ROOT_MARKDOWN_PATTERNS)) {
        files.push(file);
      }
      
      // Remove other temporary files
      if (file.endsWith('.log') || file.endsWith('.tmp')) {
        files.push(file);
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  
  return files;
}

async function cleanupProduction(options: { dryRun?: boolean; verbose?: boolean }): Promise<CleanupReport> {
  const report: CleanupReport = {
    filesRemoved: [],
    filesPreserved: [],
    errors: [],
    summary: '',
  };
  
  console.log('\n🧹 Production Cleanup Script\n');
  console.log('=' .repeat(50));
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be actually removed\n');
  }
  
  // Get files to remove
  const filesToRemove = getFilesToRemove();
  
  console.log(`\nFound ${filesToRemove.length} files to remove:\n`);
  
  // Remove files
  for (const file of filesToRemove) {
    const filePath = path.join(ROOT_DIR, file);
    
    try {
      if (options.verbose) {
        console.log(`  ${options.dryRun ? '[DRY RUN]' : '🗑️ '} Removing: ${file}`);
      }
      
      if (!options.dryRun) {
        fs.unlinkSync(filePath);
      }
      
      report.filesRemoved.push(file);
    } catch (error) {
      const errorMsg = `Failed to remove ${file}: ${error}`;
      console.error(`  ❌ ${errorMsg}`);
      report.errors.push(errorMsg);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Cleanup Summary:\n');
  console.log(`  Files removed: ${report.filesRemoved.length}`);
  console.log(`  Errors: ${report.errors.length}`);
  
  if (report.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    report.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (options.dryRun) {
    console.log('\n⚠️  This was a dry run. No files were actually removed.');
    console.log('   Run without --dry-run to perform the cleanup.');
  } else {
    console.log('\n✅ Production cleanup complete!');
  }
  
  console.log('\n📁 Essential files preserved:');
  console.log('  - README.md');
  console.log('  - Configuration files (package.json, tsconfig.json, etc.)');
  console.log('  - Source code (app/, components/, lib/)');
  console.log('  - Documentation (docs/)');
  console.log('  - Tests (tests/)');
  
  report.summary = `Removed ${report.filesRemoved.length} files with ${report.errors.length} errors`;
  
  return report;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || dryRun;
  
  try {
    await cleanupProduction({ dryRun, verbose });
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

main();
