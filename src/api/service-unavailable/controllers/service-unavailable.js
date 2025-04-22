'use strict';

/**
 * service-unavailable controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::service-unavailable.service-unavailable');
