'use strict';
/* global strapi */

// Import axios to make HTTP requests
const axios = require('axios');

module.exports = (plugin) => {
  // Get the original service
  const originalService = plugin.service('magic-link');

  /**
   * Override the 'sendMagicLink' function
   * This function is originally responsible for creating the link AND emailing it.
   * We are replacing it to create the link and send it to Power Automate instead.
   */
  plugin.service('magic-link').sendMagicLink = async (options) => {
    const { email } = options;
    console.log(`[Magic Link Override] Received request for: ${email}`);

    // --- Start: Logic replicated from the original plugin ---
    // We need to find the user to generate a link for them.
    // This line will no longer show an error, as 'strapi' is declared as a global for the linter.
    const user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { email },
    });
    // If the user doesn't exist, just return (same as original plugin)
    if (!user) {
      console.log('[Magic Link Override] User not found.');
      return;
    }

    // Use the *original* 'createMagicLink' function from the plugin's service.
    // This correctly generates the token and the full URL.
    const magicLink = await originalService.createMagicLink(user);
    // --- End: Logic replicated from the original plugin ---

    console.log(`[Magic Link Override] Generated link for ${email}.`);

    // --- Start: Custom Logic (Power Automate) ---
    // Get the webhook URL from your .env file
    const powerAutomateUrl = process.env.POWER_AUTOMATE_MAGIC_LINK_URL;

    if (!powerAutomateUrl) {
      console.error('[Magic Link Override] POWER_AUTOMATE_MAGIC_LINK_URL is not set in .env');
      throw new Error('Power Automate Webhook URL is not configured.');
    }

    // This is the data you will send to Power Automate.
    // Your flow should be set up to expect 'recipientEmail' and 'magicLinkUrl'.
    const payload = {
      recipientEmail: email,
      magicLinkUrl: magicLink,
      username: user.username, // You can send any other user data you need
    };

    try {
      console.log('[Magic Link Override] Sending payload to Power Automate...');
      
      // Make the POST request
      await axios.post(powerAutomateUrl, payload);
      
      console.log('[Magic Link Override] Successfully triggered Power Automate flow.');
      
      // The original function returns true on success
      return true;

    } catch (error) {
      console.error('[Magic Link Override] Error triggering Power Automate flow:', error.message);
      // Throw an error so the front-end knows something went wrong
      throw new Error('Failed to trigger Power Automate flow.');
    }
    // --- End: Custom Logic (Power Automate) ---
  };

  // Return the modified plugin
  return plugin;
};
