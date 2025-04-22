import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildProduction() {
  console.log('🚀 Starting production build...');
  
  try {
    // Ensure dist directory exists
    await fs.mkdir('dist', { recursive: true });
    await fs.mkdir('dist/client', { recursive: true });
    
    // Step 1: Build client
    console.log('📦 Building client with Vite...');
    try {
      await execAsync('vite build --config vite.config.prod.js');
      console.log('✅ Client build complete!');
    } catch (error) {
      console.error('❌ Client build failed:', error.stderr || error.message);
      throw error;
    }
    
    // Step 2: Copy server.js to dist
    console.log('📋 Copying server files...');
    await fs.copyFile('server.js', 'dist/server.js');
    
    // Step 3: Copy package.json.production to dist/package.json
    await fs.copyFile('package.json.production', 'dist/package.json');
    
    // Step 4: Create .env file
    await fs.writeFile('dist/.env', 'PORT=80\n', 'utf-8');
    
    // Step 5: Create Procfile
    await fs.writeFile('dist/Procfile', 'web: node server.js\n', 'utf-8');
    
    console.log('✨ Production build completed successfully!');
    console.log('📂 Deployment files are in the dist directory.');
    console.log('🚀 Ready for deployment!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProduction();
