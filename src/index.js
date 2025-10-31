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
    // We are programmatically extending the email service
    const originalEmailService = strapi.service('plugin::email.email');

    // Create the new, overridden service
    const customEmailService = {
      // First, spread all original service functions
      ...originalEmailService,

      // Then, override the 'send' function
      async send(options) {
        const { to, subject, html } = options;

        // I added "V6-INDEX" to the log so we know this new script is running
        console.log(`[Email Override V6-INDEX] Intercepted email to: ${to} | Subject: ${subject}`);

        // --- Start: Custom Staff Check ---
        const staffMember = await strapi.db.query("api::staff.staff").findOne({
          where: { email: to },
        });

        if (!staffMember) {
          console.warn(`[Email Override V6-INDEX] Email ${to} not found in Staff table. Aborting.`);
          return true;
        }

        console.log(`[Email Override V6-INDEX] Email ${to} confirmed as Staff member. Proceeding...`);
        // --- End: Custom Staff Check ---

        // Check if this is the magic link email
        if (subject === MAGIC_LINK_SUBJECT) {
          console.log(`[Email Override V6-INDEX] Magic Link email detected! Sending to Power Automate.`);

          const powerAutomateUrl = process.env.POWER_AUTOMATE_MAGIC_LINK_URL;

          if (!powerAutomateUrl) {
            console.error('[Email Override V6-INDEX] POWER_AUTOMATE_MAGIC_LINK_URL is not set in .env.');
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
            console.log('[Email Override V6-INDEX] Sending payload to Power Automate...');
            await axios.post(powerAutomateUrl, payload);
            console.log('[Email Override V6-INDEX] Successfully triggered Power Automate flow.');
            return true;
          } catch (error) {
            console.error('[Email Override V6-INDEX] Error triggering Power Automate flow:', error.message);
            throw new Error('Failed to trigger Power Automate flow.');
          }
        }

        // --- This is the crucial part ---
        // If it's not a magic link, pass it to the *original email provider*
        console.log(`[Email Override V6-INDEX] Other email detected. Passing to original provider.`);
        try {
          const provider = strapi.plugin('email').provider;
          await provider.send(options);
        } catch (error) {
          console.error('[Email Override V6-INDEX] Error sending via original provider:', error.message);
        }

        return true;
      },
    };

    // Finally, replace the core email service with our custom one
    strapi.container.set('plugin::email.email', customEmailService);
    console.log('[Strapi Register] Custom email service has been injected.');
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap(/*{ strapi }*/) {},
};