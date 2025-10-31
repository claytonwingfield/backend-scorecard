module.exports = ({ env }) => ({
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true, // This enables the v3-style queries
      playgroundAlways: true,
      depthLimit: 7,
      defaultLimit: 100000,
      maxLimit: 100000, // Sets the max number of results to a higher value
      apolloServer: {
        tracing: false,
      },
    },
  },
  email: {
    config: {
      // Use nodemailer since it's in your package.json
      provider: 'nodemailer', 
      providerOptions: {
        // We can use dummy values here, as our override
        // will intercept the 'send' call before it
        // actually tries to connect to an SMTP server.
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'username',
          pass: 'password',
        },
      },
      settings: {
        defaultFrom: 'noreply@example.com',
        defaultReplyTo: 'noreply@example.com',
      },
    },
  },
  // ... any other plugin configs
});