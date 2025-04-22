'use strict';

/**
 * internal-server-error router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::internal-server-error.internal-server-error');
