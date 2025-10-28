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
});