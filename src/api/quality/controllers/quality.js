'use strict';

/**
 * quality controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quality.quality');
