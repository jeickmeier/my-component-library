#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DEFAULT_IGNORE_DIRS = ['.git', 'node_modules', 'dist', 'build', '.next', '.cache'];
const DEFAULT_IGNORE_EXTENSIONS = ['.lock', '.log', '.map', '.md', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico'];
const DEFAULT_MAX_FILE_SIZE_MB = 1; // Skip files larger than this size

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node concat-codebase.js <directory> [options]

Options:
  --output, -o       Output file path (default: code-concatenated.txt)
  --ignore-dirs      Comma-separated list of directories to ignore
  --ignore-exts      Comma-separated list of file extensions to ignore
  --max-size         Maximum file size in MB (default: ${DEFAULT_MAX_FILE_SIZE_MB})
  --with-line-numbers Include line numbers in output
  --help, -h         Show this help message
  
Example:
  node concat-codebase.js ./my-project -o project-code.txt
`);
  process.exit(0);
}

// Process arguments
const targetDir = args[0];
const outputPath = getArgValue(args, ['--output', '-o']) || 'code-concatenated.txt';
const ignoreDirectories = (getArgValue(args, ['--ignore-dirs']) || DEFAULT_IGNORE_DIRS.join(',')).split(',');
const ignoreExtensions = (getArgValue(args, ['--ignore-exts']) || DEFAULT_IGNORE_EXTENSIONS.join(',')).split(',');
const maxFileSizeMB = parseFloat(getArgValue(args, ['--max-size']) || DEFAULT_MAX_FILE_SIZE_MB);
const withLineNumbers = args.includes('--with-line-numbers');

// Helper function to get argument value
function getArgValue(args, flags) {
  for (let i = 0; i < args.length; i++) {
    if (flags.includes(args[i]) && i + 1 < args.length) {
      return args[i + 1];
    }
  }
  return null;
}

// Main function
async function concatenateFiles() {
  console.log(`Starting concatenation from directory: ${targetDir}`);
  console.log(`Output will be saved to: ${outputPath}`);
  
  let totalFiles = 0;
  let totalSize = 0;
  let output = `# Concatenated Code from ${targetDir}\n`;
  output += `# Generated on ${new Date().toISOString()}\n\n`;

  // Recursively process files
  async function processDirectory(dirPath, relativePath = '') {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip ignored directories
        if (ignoreDirectories.includes(entry.name)) {
          console.log(`Skipping ignored directory: ${entryRelativePath}`);
          continue;
        }
        
        await processDirectory(fullPath, entryRelativePath);
      } 
      else if (entry.isFile()) {
        // Skip files with ignored extensions
        if (ignoreExtensions.some(ignoreExt => entry.name.endsWith(ignoreExt))) {
          console.log(`Skipping file with ignored extension: ${entryRelativePath}`);
          continue;
        }
        
        // Skip files that are too large
        const stats = fs.statSync(fullPath);
        const fileSizeMB = stats.size / (1024 * 1024);
        if (fileSizeMB > maxFileSizeMB) {
          console.log(`Skipping file exceeding size limit (${fileSizeMB.toFixed(2)}MB): ${entryRelativePath}`);
          continue;
        }
        
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          output += `\n\n${'='.repeat(80)}\n`;
          output += `File: ${entryRelativePath}\n`;
          output += `${'='.repeat(80)}\n\n`;
          
          if (withLineNumbers) {
            const lines = content.split('\n');
            output += lines.map((line, idx) => `${(idx + 1).toString().padStart(5)}: ${line}`).join('\n');
          } else {
            output += content;
          }
          
          totalFiles++;
          totalSize += stats.size;
          console.log(`Processed: ${entryRelativePath} (${(fileSizeMB).toFixed(2)}MB)`);
        } catch (err) {
          console.error(`Error processing file ${entryRelativePath}: ${err.message}`);
        }
      }
    }
  }
  
  try {
    // Make sure target directory exists
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
      console.error(`Error: "${targetDir}" is not a valid directory`);
      process.exit(1);
    }
    
    // Process all files
    await processDirectory(targetDir);
    
    // Write output file
    fs.writeFileSync(outputPath, output);
    
    console.log(`\nConcatenation complete!`);
    console.log(`Total files processed: ${totalFiles}`);
    console.log(`Total size: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`Output saved to: ${outputPath}`);
  } catch (err) {
    console.error(`Unexpected error: ${err.message}`);
    process.exit(1);
  }
}

// Run the script
concatenateFiles(); 