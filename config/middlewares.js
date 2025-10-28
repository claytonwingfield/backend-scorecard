module.exports = [
  'strapi::errors',
  'strapi::security',
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