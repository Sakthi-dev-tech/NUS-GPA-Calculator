const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');
const nojekyllPath = path.join(outDir, '.nojekyll');

// Ensure out directory exists
if (fs.existsSync(outDir)) {
  fs.writeFileSync(nojekyllPath, '');
  console.log('Created .nojekyll file');
} else {
  console.log('out directory does not exist yet');
}
