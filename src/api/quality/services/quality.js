'use strict';

/**
 * quality service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::quality.quality');
