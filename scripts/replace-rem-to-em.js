import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to files to process
const distPath = path.resolve(__dirname, '../dist');

// Function to replace rem with em
function replaceRemWithEm(filePath) {
  console.log(`Processing file: ${filePath}`);
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace any number (integer or float) followed by "rem" with the same number followed by "em"
  const remPattern = /(\d*\.\d+|\d+)rem/g;
  const result = content.replace(remPattern, '$1em');
  
  // Write the result back to the file
  fs.writeFileSync(filePath, result, 'utf8');
  
  // Count occurrences of replacement
  const remCount = (content.match(remPattern) || []).length;
  console.log(`Replaced ${remCount} occurrences of rem with em in ${filePath}`);
}

// Function to process all files in a directory
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory does not exist: ${dirPath}`);
    return;
  }
  
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      // Process CSS files and JavaScript files that might contain embedded CSS
      if (file.endsWith('.css') || file.endsWith('.js')) {
        replaceRemWithEm(filePath);
      }
    }
  });
}

// Process both dist directories
console.log('Processing main dist directory...');
processDirectory(distPath);

console.log('Rem to Em conversion completed.'); 