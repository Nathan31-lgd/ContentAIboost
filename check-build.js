import fs from 'fs';
import path from 'path';

console.log('=== Build Check ===');
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);

const distPath = path.join(process.cwd(), 'dist');
const clientPath = path.join(distPath, 'client');
const indexPath = path.join(clientPath, 'index.html');

console.log('\nChecking paths:');
console.log('- dist exists:', fs.existsSync(distPath));
console.log('- dist/client exists:', fs.existsSync(clientPath));
console.log('- dist/client/index.html exists:', fs.existsSync(indexPath));

if (fs.existsSync(clientPath)) {
  console.log('\nContents of dist/client:');
  const files = fs.readdirSync(clientPath);
  files.forEach(file => console.log(`  - ${file}`));
}

console.log('\n=== End Build Check ==='); 