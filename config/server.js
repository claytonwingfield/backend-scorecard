// ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  
  // *** THIS IS THE CRUCIAL LINE ***
  // It tells the Strapi Node.js server its external public address.
  url: env('https://backend-scorecard.onrender.com/admin', 'http://localhost:1337'), 
  // RENDER_EXTERNAL_URL is set by Render to: https://backend-scorecard.onrender.com

  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});