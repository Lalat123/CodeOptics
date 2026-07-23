const fs = require('fs');
let file = 'src/pages/Visualisation/SparseTableVisualizer.jsx';
let c = fs.readFileSync(file, 'utf8');

// Replace \` with `
c = c.replace(/\\`/g, '`');
// Replace \$ with $
c = c.replace(/\\\$/g, '$');

fs.writeFileSync(file, c);
console.log('Fixed file');
