'use strict';

/**
 * forbidden service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::forbidden.forbidden');
