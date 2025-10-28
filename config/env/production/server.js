// ./config/env/production/server.js

module.exports = ({ env }) => ({
  // CORRECTED: This tells Strapi to use the value of the environment variable RENDER_EXTERNAL_URL.
  // We don't provide a second argument, as Render guarantees this variable is set.
  url: env('RENDER_EXTERNAL_URL'), 

  // This line is correct and necessary for HTTPS from Render's proxy/load balancer.
  proxy: true, 
  
  // You can optionally add other production settings below, but for the fix, these two lines are all you need.
});