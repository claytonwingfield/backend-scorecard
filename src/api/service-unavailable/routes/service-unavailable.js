'use strict';

/**
 * service-unavailable router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::service-unavailable.service-unavailable');
