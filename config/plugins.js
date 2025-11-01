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
        host: 'smtp.gmail.com',
        port: 465,
        
        auth: {
          user: 'svghda@gmail.com',
          pass: 'bocq nrrq bmpr gnch',
        },
      },
      settings: {
        defaultFrom: 'svghda@gmail.com',
        defaultReplyTo: 'svghda@gmail.com',
      },
    },
  },
 
  // ... any other plugin configs
});