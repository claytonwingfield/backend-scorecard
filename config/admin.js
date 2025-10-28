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
  // -- ADD THIS BLOCK --
  vite: {
    server: {
      allowedHosts: [
        'backend-scorecard.onrender.com',
        'localhost', // Keep this for your local development
      ],
    },
  },
  // -- END OF BLOCK --
});