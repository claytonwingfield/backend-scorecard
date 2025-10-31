'use strict';
/* global strapi */

const axios = require('axios');

// =================================================================
// IMPORTANT: CHECK THIS VALUE
// =================================================================
const MAGIC_LINK_SUBJECT = "Your Magic Link Login";
// =================================================================

module.exports = ({ strapi }) => ({
  /**
   * Override the 'send' function for the core email plugin.
   * This will now intercept *all* emails sent by Strapi v5.
   */
  async send(options) {
    const { to, subject, html } = options;

    // I am adding "V9-FINAL" so we see a new log
    console.log(`[Email Override V9-FINAL] Intercepted email to: ${to} | Subject: ${subject}`);

    // --- Start: Custom Staff Check ---
    const staffMember = await strapi.db.query("api::staff.staff").findOne({
      where: { email: to },
    });

    // If they are not in the staff table, do not proceed.
    if (!staffMember) {
      console.warn(`[Email Override V9-FINAL] Email ${to} not found in Staff table. Aborting.`);
      return true;
    }

    console.log(`[Email Override V9-FINAL] Email ${to} confirmed as Staff member. Proceeding...`);
    // --- End: Custom Staff Check ---


    // Check if this is the magic link email we want to intercept
    if (subject === MAGIC_LINK_SUBJECT) {
      console.log(`[Email Override V9-FINAL] Magic Link email detected! Sending to Power Automate.`);

      const powerAutomateUrl = process.env.POWER_AUTOMATE_MAGIC_LINK_URL;

      if (!powerAutomateUrl) {
        console.error('[Email Override V9-FINAL] POWER_AUTOMATE_MAGIC_LINK_URL is not set in .env.');
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
        console.log('[Email Override V9-FINAL] Sending payload to Power Automate...');
        await axios.post(powerAutomateUrl, payload);
        console.log('[Email Override V9-FINAL] Successfully triggered Power Automate flow.');
        return true;  

      } catch (error) {
        console.error('[Email Override V9-FINAL] Error triggering Power Automate flow:', error.message);
        throw new Error('Failed to trigger Power Automate flow.');
      }
    }

    // ---
    // If it's not a magic link, pass it to the original email provider
    // ---
    console.log(`[Email Override V9-FINAL] Other email detected. Passing to original email provider.`);
    
    try {
      const provider = strapi.plugin('email').provider;
      await provider.send(options);
    } catch (error) {
      console.error('[Email Override V9-FINAL] Error sending email via original provider:', error.message);
    }
    
    return true;
  },
});