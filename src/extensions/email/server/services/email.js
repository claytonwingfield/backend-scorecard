'use strict';
/* global strapi */

const axios = require('axios');
const originalEmailService = require('@strapi/plugin-email/server/services/email');

// =================================================================
// IMPORTANT: CHECK THIS VALUE
// =================================================================
// Go to your Strapi Admin Panel -> Settings -> Magic Link -> Settings
// Find the "Email subject line" (or "object") setting.
// Copy that value and paste it here.
const MAGIC_LINK_SUBJECT = "Your Magic Link Login";
// =================================================================

module.exports = ({ strapi }) => {
  // Create the original service instance
  const originalService = originalEmailService({ strapi });

  // Return our new, decorated service object
  return {
    // First, spread all original service functions
    ...originalService,

    // Then, override the 'send' function
    async send(options) {
      const { to, subject, html } = options;

      console.log(`[Email Override] Intercepted email to: ${to} | Subject: ${subject}`);

      // --- Start: Custom Staff Check ---
      // Check if this email exists in your custom 'Staff' table
      const staffMember = await strapi.db.query("api::staff.staff").findOne({
        where: { email: to },
      });

      // If they are not in the staff table, do not proceed.
      if (!staffMember) {
        console.warn(`[Email Override] Email ${to} not found in Staff table. Aborting.`);
        // We return 'true' to the frontend so it doesn't know the user doesn't exist.
        // This prevents "user enumeration" attacks.
        return true;
      }

      console.log(`[Email Override] Email ${to} confirmed as Staff member. Proceeding...`);
      // --- End: Custom Staff Check ---


      // Check if this is the magic link email we want to intercept
      if (subject === MAGIC_LINK_SUBJECT) {
        console.log(`[Email Override] Magic Link email detected! Sending to Power Automate instead.`);

        // --- Start: Custom Logic (Power Automate) ---
        const powerAutomateUrl = process.env.POWER_AUTOMATE_MAGIC_LINK_URL;

        if (!powerAutomateUrl) {
          console.error('[Email Override] POWER_AUTOMATE_MAGIC_LINK_URL is not set in .env. Please check your Render environment variables.');
          throw new Error('Power Automate Webhook URL is not configured.');
        }
        
        // In this case, the `html` body *contains* the full link.
        // We don't need to generate it. We just forward the email body.
        const payload = {
          recipientEmail: to,
          emailSubject: subject,
          emailBody: html, // The HTML body of the email *is* the payload
          agentName: staffMember.agentname, // We can also send staff data
          department: staffMember.department, // since we already fetched it!
        };

        try {
          console.log('[Email Override] Sending payload to Power Automate...');
          
          await axios.post(powerAutomateUrl, payload);
          
          console.log('[Email Override] Successfully triggered Power Automate flow.');
          
          // Return true to make the magic-link plugin think the email was sent.
          return true;  

        } catch (error) {
          console.error('[Email Override] Error triggering Power Automate flow:', error.message);
          throw new Error('Failed to trigger Power Automate flow.');
        }
        // --- End: Custom Logic (Power Automate) ---
      }

      // --- This is the new, important part ---
      // If it's not a magic link, pass it to the original email service
      // This ensures other emails (password reset, etc.) still work
      console.log(`[Email Override] Other email detected. Passing to original email service.`);
      return originalService.send(options);
    },
  };
};