'use strict';
/* global strapi */

const axios = require('axios');

// =================================================================
// IMPORTANT: CHECK THIS VALUE
// =================================================================
// Go to your Strapi Admin Panel -> Settings -> Magic Link -> Settings
// Find the "Email subject line" (or "object") setting.
// Copy that value and paste it here.
const MAGIC_LINK_SUBJECT = "Your Magic Link Login";
// =================================================================

module.exports = ({ strapi }) => ({
  /**
   * Override the 'send' function for the core email plugin.
   * This will now intercept *all* emails sent by Strapi v5.
   */
  async send(options) {
    const { to, subject, html } = options;

    // I added "V5" to the log so we can be sure the new script is running
    console.log(`[Email Override V5] Intercepted email to: ${to} | Subject: ${subject}`);

    // --- Start: Custom Staff Check ---
    const staffMember = await strapi.db.query("api::staff.staff").findOne({
      where: { email: to },
    });

    // If they are not in the staff table, do not proceed.
    if (!staffMember) {
      console.warn(`[Email Override V5] Email ${to} not found in Staff table. Aborting.`);
      // We return 'true' to the frontend so it doesn't know the user doesn't exist.
      return true;
    }

    console.log(`[Email Override V5] Email ${to} confirmed as Staff member. Proceeding...`);
    // --- End: Custom Staff Check ---


    // Check if this is the magic link email we want to intercept
    if (subject === MAGIC_LINK_SUBJECT) {
      console.log(`[Email Override V5] Magic Link email detected! Sending to Power Automate.`);

      // --- Start: Custom Logic (Power Automate) ---
      const powerAutomateUrl = process.env.POWER_AUTOMATE_MAGIC_LINK_URL;

      if (!powerAutomateUrl) {
        console.error('[Email Override V5] POWER_AUTOMATE_MAGIC_LINK_URL is not set in .env. Please check your Render environment variables.');
        throw new Error('Power Automate Webhook URL is not configured.');
      }
      
      const payload = {
        recipientEmail: to,
        emailSubject: subject,
        emailBody: html, // The HTML body of the email *is* the payload
        agentName: staffMember.agentname, // We can also send staff data
        department: staffMember.department, // since we already fetched it!
      };

      try {
        console.log('[Email Override V5] Sending payload to Power Automate...');
        
        await axios.post(powerAutomateUrl, payload);
        
        console.log('[Email Override V5] Successfully triggered Power Automate flow.');
        
        // Return true to make the magic-link plugin think the email was sent.
        return true;  

      } catch (error) {
        console.error('[Email Override V5] Error triggering Power Automate flow:', error.message);
        throw new Error('Failed to trigger Power Automate flow.');
      }
      // --- End: Custom Logic (Power Automate) ---
    }

    // --- START: NEW V5 LOGIC ---
    // If it's not a magic link, we must pass it to the *original email provider*
    // (e.g., nodemailer, sendgrid) and NOT the service, to avoid an infinite loop.
    console.log(`[Email Override V5] Other email detected. Passing to original email provider.`);
    
    try {
      // Get the *actual* provider (nodemailer, sendgrid, etc.) and call its send method
      const provider = strapi.plugin('email').provider;
      await provider.send(options);
    } catch (error) {
      console.error('[Email Override V5] Error sending email via original provider:', error.message);
      // We can absorb this error so it doesn't crash the main thread
    }
    
    return true;
    // --- END: NEW V5 LOGIC ---
  },
});