/**
 * Simple build script to convert ESM to CJS
 * Generates dist/index.cjs for CommonJS consumers
 */
const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'src', 'index.js');
const distDir = path.join(__dirname, 'dist');
const distFile = path.join(distDir, 'index.cjs');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read the ESM source
let code = fs.readFileSync(srcFile, 'utf-8');

// Convert ESM exports to CJS
code = code.replace(
  /export default VigilSDK;\nexport \{ VigilSDK \};/,
  'module.exports = VigilSDK;\nmodule.exports.VigilSDK = VigilSDK;'
);

// Write CJS version
fs.writeFileSync(distFile, code, 'utf-8');
console.log('✓ Built dist/index.cjs');
