const esbuild = require('esbuild');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config();

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/plugin/index.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  target: 'es6',
  format: 'iife',
  define: {
    'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY || ''),
  },
  logLevel: 'info',
};

async function build() {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for plugin changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log('Plugin built successfully!');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
