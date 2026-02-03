import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  plugins: [
    react(), 
    viteSingleFile(),
    {
      name: 'rename-index-to-ui',
      writeBundle(options, bundle) {
        const fs = require('fs');
        const outDir = options.dir || '../../dist';
        const indexPath = path.join(outDir, 'index.html');
        const uiPath = path.join(outDir, 'ui.html');
        if (fs.existsSync(indexPath)) {
          fs.renameSync(indexPath, uiPath);
        }
      }
    }
  ],
  root: 'src/ui',
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/ui/index.html',
      output: {
        entryFileNames: 'ui.js',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@plugin': path.resolve(__dirname, 'src/plugin'),
    },
  },
});
