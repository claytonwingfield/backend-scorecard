'use strict';

/**
 * wfm service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::wfm.wfm');
