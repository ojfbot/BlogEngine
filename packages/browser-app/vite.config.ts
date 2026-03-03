import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import path from 'path';

// BlogEngine is a Module Federation REMOTE.
// The shell host at localhost:4000 loads this app's Dashboard via:
//   remotes: { blogengine: 'http://localhost:3005/assets/remoteEntry.js' }
//
// Shell shared singletons (must match exactly — version mismatches silently break):
//   react, react-dom, @reduxjs/toolkit, react-redux, @carbon/react
//
// Production: shell uses VITE_REMOTE_BLOGENGINE=https://blog.frame.jim.software
// CORS for remoteEntry.js must allow https://frame.jim.software in production.

export default defineConfig({
  plugins: [
    react(),
    // cssInjectedByJs must come before federation — intercepts CSS extraction and
    // converts it to JS style-injection so exposed modules carry their own styles.
    // jsAssetsFilterFunction scopes injection to our exposed bundles only — without
    // it the plugin picks a shared chunk (react-dom) the shell never loads (singleton
    // provided by host), so CSS would never execute.
    //
    // The `__federation_expose_` prefix is @originjs/vite-plugin-federation's internal
    // chunk naming convention (verified at v1.4.x). If CSS stops loading after a plugin
    // upgrade, check dist/ chunk names and update these strings accordingly.
    cssInjectedByJs({
      jsAssetsFilterFunction: ({ fileName }) =>
        fileName.includes('__federation_expose_Dashboard') ||
        fileName.includes('__federation_expose_Settings'),
    }),
    federation({
      name: 'blogengine',
      filename: 'remoteEntry.js',
      exposes: {
        // Approved MF surface area for the shell. Do not expose internal components.
        // Dashboard: primary content view loaded by the shell host.
        // Settings: bare settings panel; shell provides the <Modal> chrome.
        './Dashboard': './src/components/Dashboard',
        './Settings': './src/components/settings/SettingsPanel',
      },
      // `singleton`/`requiredVersion` are valid MF config but typed as commented-out
      // in @originjs/vite-plugin-federation types (plugin type gap, not our bug).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shared: {
        react:              { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom':        { singleton: true, requiredVersion: '^18.3.1' },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.5.0' },
        'react-redux':      { singleton: true, requiredVersion: '^9.2.0' },
        '@carbon/react':    { singleton: true, requiredVersion: '^1.67.0' },
      } as any,
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
