'use strict';

/**
 * forbidden controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::forbidden.forbidden');
