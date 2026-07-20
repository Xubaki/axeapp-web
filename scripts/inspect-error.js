const fs = require('fs');
const code = fs.readFileSync('.next/server/pages/_error.js', 'utf8');
const idx = code.indexOf('Html');
if (idx > 0) {
  console.log('Html found at:', idx);
  console.log(code.substring(idx - 100, idx + 200));
} else {
  console.log('No Html found in _error.js');
}
// Find the chunk IDs referenced
const chunkMatches = code.match(/chunks\/\d+/g);
console.log('Chunk refs:', [...new Set(chunkMatches || [])]);
