'use strict';
/* global strapi */

const axios = require('axios');

/**
 * Strapi v5 service override.
 * @param {object} plugin - The plugin object.
 * @param {object} plugin.service - The original service.
 * @param {object} plugin.strapi - The Strapi instance.
 * @returns {object} The extended service.
 */
module.exports = (plugin) => ({
  // Keep all the original service's methods
  ...plugin.service,

  /**
   * Override the 'sendMagicLink' function
   * This function is originally responsible for creating the link AND emailing it.
   * We are replacing it to create the link and send it to Power Automate instead.
   */
  async sendMagicLink(options) {
    const { email } = options;
    console.log(`[Magic Link Override v5] Received request for: ${email}`);

    // --- Start: Logic replicated from the original plugin ---

    // V5 uses `strapi.db.query`, not `strapi.query`
    const user = await strapi.db.query("plugin::users-permissions.user").findOne({
      where: { email },
    });

    // If the user doesn't exist, just return
    if (!user) {
      console.log('[Magic Link Override v5] User not found.');
      return;
    }

    // Call the *original* 'createMagicLink' function from the plugin's service.
    // In v5, the original service is passed as `plugin.service`.
    const magicLink = await plugin.service.createMagicLink(user);
    // --- End: Logic replicated from the original plugin ---

    console.log(`[Magic Link Override v5] Generated link for ${email}.`);

    // --- Start: Custom Logic (Power Automate) ---
    // Get the webhook URL from your .env file
    const powerAutomateUrl = process.env.POWER_AUTOMATE_MAGIC_LINK_URL;

    if (!powerAutomateUrl) {
      console.error('[Magic Link Override v5] POWER_AUTOMATE_MAGIC_LINK_URL is not set in .env');
      throw new Error('Power Automate Webhook URL is not configured.');
    }

    // This is the data you will send to Power Automate.
    const payload = {
      recipientEmail: email,
      magicLinkUrl: magicLink,
      username: user.username,
    };

    try {
      console.log('[Magic Link Override v5] Sending payload to Power Automate...');
      
      // Make the POST request
      await axios.post(powerAutomateUrl, payload);
      
      console.log('[Magic Link Override v5] Successfully triggered Power Automate flow.');
      
      // The original function returns true on success
      return true;

    } catch (error) {
      console.error('[Magic Link Override v5] Error triggering Power Automate flow:', error.message);
      // Throw an error so the front-end knows something went wrong
      throw new Error('Failed to trigger Power Automate flow.');
    }
    // --- End: Custom Logic (Power Automate) ---
  },
});
