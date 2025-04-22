// ES Module compatible port fix script
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the server/index.ts file
const indexPath = join(__dirname, 'server', 'index.ts');
let content = fs.readFileSync(indexPath, 'utf8');

// Replace the port configuration to use process.env.PORT with fallback to 5000
// This ensures compatibility with both development and Cloud Run
const portRegex = /const port = .*?;/;
const newPortConfig = "const port = process.env.PORT || 5000;";

if (portRegex.test(content)) {
  content = content.replace(portRegex, newPortConfig);
  console.log("✅ Port configuration updated to use process.env.PORT");
} else {
  console.error("❌ Could not find port configuration in server/index.ts");
  process.exit(1);
}

// Write the updated content back to the file
fs.writeFileSync(indexPath, content);
console.log("✅ server/index.ts updated successfully");