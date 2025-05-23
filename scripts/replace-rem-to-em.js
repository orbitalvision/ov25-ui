import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to CSS file(s) to process
const cssFilePath = path.resolve(__dirname, '../dist/index.css');

// Function to replace rem with em
function replaceRemWithEm(filePath) {
  console.log(`Processing file: ${filePath}`);
  
  // Read the file
  let cssContent = fs.readFileSync(filePath, 'utf8');
  
  // Replace any number (integer or float) followed by "rem" with the same number followed by "em"
  const remPattern = /(\d*\.\d+|\d+)rem/g;
  const result = cssContent.replace(remPattern, '$1em');
  
  // Write the result back to the file
  fs.writeFileSync(filePath, result, 'utf8');
  
  // Count occurrences of replacement
  const remCount = (cssContent.match(remPattern) || []).length;
  console.log(`Replaced ${remCount} occurrences of rem with em in ${filePath}`);
}

// Process the file
replaceRemWithEm(cssFilePath);

console.log('Rem to Em conversion completed.'); 