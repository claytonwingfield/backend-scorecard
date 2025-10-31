'use strict';
const axios = require('axios');

// =================================================================
// IMPORTANT: CHECK THIS VALUE
// =================================================================
const MAGIC_LINK_SUBJECT = "Your Magic Link Login";
// =================================================================

module.exports = (plugin) => {
  
  // Get the original service factory
  const originalServiceFactory = plugin.services.email;

  // We are overriding the 'email' service
  // The service is a factory function, so we must return a new one
  plugin.services.email = ({ strapi }) => {
    
    // Create the original service instance
    const originalService = originalServiceFactory({ strapi });

    // Return a new service object
    return {
      // First, spread all original service functions
      ...originalService,

      // Then, override the 'send' method
      async send(options) {
        const { to, subject, html } = options;
        
        // I added "V10-STRAPI-SERVER" so we know this new log is working
        console.log(`[Email Override V10-STRAPI-SERVER] Intercepted email to: ${to} | Subject: ${subject}`);

        // --- Start: Custom Staff Check ---
        const staffMember = await strapi.db.query("api::staff.staff").findOne({
          where: { email: to },
        });

        if (!staffMember) {
          console.warn(`[Email Override V10] Email ${to} not found in Staff table. Aborting.`);
          return true;
        }

        console.log(`[Email Override V10] Email ${to} confirmed as Staff member. Proceeding...`);
        // --- End: Custom Staff Check ---


        // Check if this is the magic link email
        if (subject === MAGIC_LINK_SUBJECT) {
          console.log(`[Email Override V10] Magic Link email detected! Sending to Power Automate.`);

          const powerAutomateUrl = process.env.POWER_AUTOMATE_MAGIC_LINK_URL;

          if (!powerAutomateUrl) {
            console.error('[Email Override V10] POWER_AUTOMATE_MAGIC_LINK_URL is not set in .env.');
            throw new Error('Power Automate Webhook URL is not configured.');
          }

          const payload = {
            recipientEmail: to,
            emailSubject: subject,
            emailBody: html,
            agentName: staffMember.agentname,
            department: staffMember.department,
          };

          try {
            console.log('[Email Override V10] Sending payload to Power Automate...');
            await axios.post(powerAutomateUrl, payload);
            console.log('[Email Override V10] Successfully triggered Power Automate flow.');
            return true;
          } catch (error) {
            console.error('[Email Override V10] Error triggering Power Automate flow:', error.message);
            throw new Error('Failed to trigger Power Automate flow.');
          }
        }

        // ---
        // If it's not a magic link, call the original send function
        // ---
        console.log(`[Email Override V10] Other email detected. Passing to original service.send().`);
        return originalService.send(options);
      }
    };
  };

  // Return the modified plugin
  return plugin;
};