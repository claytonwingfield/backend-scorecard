module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // === THIS IS THE FIX ===
  // Tells Strapi its public URL (Render provides RENDER_EXTERNAL_URL automatically)
  url: env('https://backend-scorecard.onrender.com/admin this is my external url', 'http://localhost:1337'), 
  // =======================
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});