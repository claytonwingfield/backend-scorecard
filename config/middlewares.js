module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          
          // *** ADD YOUR RENDER DOMAIN HERE ***
          'img-src': ["'self'", 'data:', 'blob:', 'https://backend-scorecard.onrender.com'], 
          'media-src': ["'self'", 'data:', 'blob:', 'https://backend-scorecard.onrender.com'],
          // **********************************
          
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      // Add your Next.js app's URL here
      origin: [
        'http://localhost:1337',
        'http://localhost:3000',
        'http://172.26.133.255:3000', // <-- THE IMPORTANT ONE
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];