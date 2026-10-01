const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../tools/bookmarklet/src/dom-extractor.js');
const distPath = path.join(__dirname, '../tools/bookmarklet/index.js');

try {
  const code = fs.readFileSync(srcPath, 'utf8');
  
  // Safer minify: remove lines that START with // after trimming
  const minified = code
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//')) return '';
      return line;
    })
    .join(' ')
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
    
  const bookmarklet = `javascript:${encodeURIComponent(minified)}`;
  
  fs.writeFileSync(distPath, bookmarklet);
  console.log('Bookmarklet built successfully at tools/bookmarklet/index.js');
} catch (error) {
  console.error('Error building bookmarklet:', error);
}
