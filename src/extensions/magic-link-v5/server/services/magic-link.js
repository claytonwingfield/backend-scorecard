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

    // --- Start: Custom Logic (Check Staff Table) ---
    // First, check if this email exists in your custom 'Staff' table
    const staffMember = await strapi.db.query("api::staff.staff").findOne({
      where: { email },
    });

    // If they are not in the staff table, do not proceed.
    if (!staffMember) {
      console.warn(`[Magic Link Override v5] Email ${email} not found in Staff table. Aborting.`);
      // We return 'true' to the frontend so it doesn't know the user doesn't exist.
      // This prevents "user enumeration" attacks.
      return true;
    }
    
    console.log(`[Magic Link Override v5] Found matching staff member: ${staffMember.agentname || email}`);
    // --- End: Custom Logic (Check Staff Table) ---


    // --- Start: Logic replicated from the original plugin ---
    // Now that we've confirmed they are staff, find their *login account*
    // in the 'users-permissions' table.
    const user = await strapi.db.query("plugin::users-permissions.user").findOne({
      where: { email },
    });

    // If the user doesn't have a login account, just return
    if (!user) {
      console.warn(`[Magic Link Override v5] Staff member ${email} exists, but has no corresponding login account. Aborting.`);
      return true; // Again, return true for security.
    }

    // Call the *original* 'createMagicLink' function from the plugin's service.
    // This function requires the 'user' object (from users-permissions).
    const magicLink = await plugin.service.createMagicLink(user);
    // --- End: Logic replicated from the original plugin ---

    console.log(`[Magic Link Override v5] Generated magic link for ${email}.`);

    // --- Start: Custom Logic (Power Automate) ---
    const powerAutomateUrl = process.env.POWER_ATE_MAGIC_LINK_URL; // NOTE: Renamed env variable

    if (!powerAutomateUrl) {
      console.error('[Magic Link Override v5] POWER_ATE_MAGIC_LINK_URL is not set in .env');
      throw new Error('Power Automate Webhook URL is not configured.');
    }

    const payload = {
      recipientEmail: email,
      magicLinkUrl: magicLink,
      username: user.username,
      agentName: staffMember.agentname, // You can now send staff data!
      department: staffMember.department, // And this
    };

    try {
      console.log('[Magic Link Override v5] Sending payload to Power Automate...');
      
      // Make the POST request
      await axios.post(powerAutomateUrl, payload);
      
      console.log('[Magic Link Override v5] Successfully triggered Power Automate flow.');
      
      return true;

    } catch (error) {
      console.error('[Magic Link Override v5] Error triggering Power Automate flow:', error.message);
      throw new Error('Failed to trigger Power Automate flow.');
    }
    // --- End: Custom Logic (Power Automate) ---
  },
});

