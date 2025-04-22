import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

async function buildServer() {
  try {
    await build({
      entryPoints: ['server/index.ts'],
      outfile: 'dist/server.js',
      bundle: true,
      minify: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      plugins: [nodeExternalsPlugin()],
    });
    console.log('Server build complete!');
  } catch (error) {
    console.error('Server build failed:', error);
    process.exit(1);
  }
}

buildServer();
