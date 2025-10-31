'use strict';

const axios = require('axios');

// =================================================================
// IMPORTANT: CHECK THIS VALUE
// =================================================================
const MAGIC_LINK_SUBJECT = "Your Magic Link Login";
// =================================================================

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }) {
    // This is the official Strapi v5 way to extend a plugin's service
    strapi.extend('plugin::email.email', (originalService) => {
      
      console.log('[Strapi Register] Extending plugin::email.email service...');

      // Return the new, overridden service object
      return {
        // First, spread all original service functions
        ...originalService,

        // Then, override the 'send' function
        async send(options) {
          const { to, subject, html } = options;

          // I added "V7-EXTEND" to the log so we know this new script is running
          console.log(`[Email Override V7-EXTEND] Intercepted email to: ${to} | Subject: ${subject}`);

          // --- Start: Custom Staff Check ---
          const staffMember = await strapi.db.query("api::staff.staff").findOne({
            where: { email: to },
          });

          if (!staffMember) {
            console.warn(`[Email Override V7-EXTEND] Email ${to} not found in Staff table. Aborting.`);
            return true;
          }

          console.log(`[Email Override V7-EXTEND] Email ${to} confirmed as Staff member. Proceeding...`);
          // --- End: Custom Staff Check ---

          // Check if this is the magic link email
          if (subject === MAGIC_LINK_SUBJECT) {
            console.log(`[Email Override V7-EXTEND] Magic Link email detected! Sending to Power Automate.`);

            const powerAutomateUrl = process.env.POWER_AUTOMATE_MAGIC_LINK_URL;

            if (!powerAutomateUrl) {
              console.error('[Email Override V7-EXTEND] POWER_AUTOMATE_MAGIC_LINK_URL is not set in .env.');
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
              console.log('[Email Override V7-EXTEND] Sending payload to Power Automate...');
              await axios.post(powerAutomateUrl, payload);
              console.log('[Email Override V7-EXTEND] Successfully triggered Power Automate flow.');
              return true;
            } catch (error) {
              console.error('[Email Override V7-EXTEND] Error triggering Power Automate flow:', error.message);
              throw new Error('Failed to trigger Power Automate flow.');
            }
          }

          // --- This is the crucial part ---
          // If it's not a magic link, call the *original* send function
          // that we received in the 'originalService' parameter.
          console.log(`[Email Override V7-EXTEND] Other email detected. Passing to original service.send().`);
          return originalService.send(options);
        },
      };
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap(/*{ strapi }*/) {},
};