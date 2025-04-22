'use strict';

/**
 * internal-server-error service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::internal-server-error.internal-server-error');
