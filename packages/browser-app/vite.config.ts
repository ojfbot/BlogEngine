import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

// BlogEngine is a Module Federation REMOTE.
// The shell host at localhost:4000 loads this app's Dashboard via:
//   remotes: { blogengine: 'http://localhost:3005/assets/remoteEntry.js' }
//
// Shell shared singletons (must match exactly — version mismatches silently break):
//   react, react-dom, @reduxjs/toolkit, react-redux
//
// Production: shell uses VITE_REMOTE_BLOGENGINE=https://blog.frame.jim.software
// CORS for remoteEntry.js must allow https://frame.jim.software in production.

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'blogengine',
      filename: 'remoteEntry.js',
      exposes: {
        // SCAFFOLD: Dashboard is the single entry point the shell loads.
        // Do not expose internal components — shell only needs the top-level view.
        './Dashboard': './src/components/Dashboard',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.5.0' },
        'react-redux': { singleton: true, requiredVersion: '^9.2.0' },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3005,
    cors: true, // required: shell host fetches remoteEntry.js cross-origin
  },
  preview: {
    port: 3005,
    cors: true,
  },
  build: {
    // Module Federation requires esnext — legacy chunk format breaks remote loading
    target: 'esnext',
    minify: false,
  },
});
