'use strict';

/**
 * internal-server-error controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::internal-server-error.internal-server-error');
