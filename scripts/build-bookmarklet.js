const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

const srcPath = path.join(__dirname, '../tools/bookmarklet/src/dom-extractor.js');
const distPath = path.join(__dirname, '../tools/bookmarklet/index.js');
const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3001';
const dashboardUrl = process.env.VITE_DASHBOARD_URL || 'http://localhost:5173';

try {
  let code = fs.readFileSync(srcPath, 'utf8');
  code = code.replace(/__API_BASE_URL__/g, apiUrl);
  code = code.replace(/__DASHBOARD_URL__/g, dashboardUrl);
  
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
