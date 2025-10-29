// src/admin/vite.config.js

import { defineConfig, mergeConfig } from 'vite';

export default (config) => {
  return mergeConfig(
    config,
    defineConfig({
      server: {
        // Explicitly list all allowed production and development hosts
        allowedHosts: [
          'backend-scorecard.onrender.com', // Your live domain
          'localhost',                      // Your local domain
        ],
      },
      // You can remove this resolve block if it was originally there
      resolve: {
        alias: {
          '@': '/src',
        },
      },
    })
  );
};