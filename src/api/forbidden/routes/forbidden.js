'use strict';

/**
 * forbidden router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::forbidden.forbidden');
