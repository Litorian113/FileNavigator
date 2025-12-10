const esbuild = require('esbuild');
const dotenv = require('dotenv');

// Load environment variables from .env file
const env = dotenv.config().parsed || {};

// Create a define object to replace process.env.KEY with the actual value
const define = {};
for (const k in env) {
  define[`process.env.${k}`] = JSON.stringify(env[k]);
}

esbuild.build({
  entryPoints: ['code.ts'],
  bundle: true,
  outfile: 'code.js',
  target: 'es6',
  define: define,
  minify: false, // Set to true for production
}).catch(() => process.exit(1));
