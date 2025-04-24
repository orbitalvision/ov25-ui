import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./dist/index.js');

try {
  // Read the current content of the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the import is already present to avoid duplicates
  if (!content.includes("import './index.css';")) {
    // Prepend the CSS import statement
    content = "import './index.css';\n" + content;
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, content);
    console.log('Successfully injected CSS import to dist/index.js');
  } else {
    console.log('CSS import already exists in dist/index.js');
  }
} catch (error) {
  console.error('Error injecting CSS import:', error);
  process.exit(1);
} 