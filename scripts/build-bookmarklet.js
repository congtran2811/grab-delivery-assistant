const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../tools/bookmarklet/src/dom-extractor.js');
const distPath = path.join(__dirname, '../tools/bookmarklet/index.js');

try {
  const code = fs.readFileSync(srcPath, 'utf8');
  
  // Simple minify by removing single line comments and whitespace
  const minified = code
    .replace(/\/\/.*/g, '') // remove inline comments
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
    
  const bookmarklet = `javascript:${encodeURIComponent(minified)}`;
  
  fs.writeFileSync(distPath, bookmarklet);
  console.log('Bookmarklet built successfully at tools/bookmarklet/index.js');
} catch (error) {
  console.error('Error building bookmarklet:', error);
}
