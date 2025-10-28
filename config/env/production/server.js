// ./config/env/production/server.js

module.exports = ({ env }) => ({
  // Set the external URL using Render's environment variable.
  url: env('https://backend-scorecard.onrender.com/admin'), 

  // *** THIS IS THE FINAL CRUCIAL FIX ***
  // This tells Strapi (running Node.js) that it is behind a trusted proxy 
  // (Render's load balancer), which correctly handles HTTPS.
  proxy: true,
  // ------------------------------------

  // Optional: Add other production-specific settings here if needed
});