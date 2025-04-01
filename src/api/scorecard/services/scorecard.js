'use strict';

/**
 * scorecard service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::scorecard.scorecard');
