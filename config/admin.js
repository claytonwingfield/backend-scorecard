// ./config/admin.js

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  
  // *** THIS IS THE DEFINITIVE FIX ***
  vite: {
    server: {
      // Setting to 'true' tells the admin panel to trust all hosts, 
      // which is necessary when running behind a proxy like Render.
      allowedHosts: true, 
    },
  },
  // **********************************
});