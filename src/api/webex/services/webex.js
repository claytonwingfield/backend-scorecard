'use strict';

/**
 * webex service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::webex.webex');
