"use strict";

const axios = require('axios');

// IMPORTANT: Set this to the *exact* subject you configured
// in the Magic Link admin panel (e.g., "Your Magic Link for Login")
// If your subject is different, this code will not work.
const MAGIC_LINK_SUBJECT = "Your Magic Link for Login"; // <-- CHECK THIS

module.exports = (plugin) => {
  // Check if the email service exists. If not, create a dummy one.
  // This prevents Strapi from crashing if no email provider is configured.
  if (!plugin.services.email) {
    plugin.services = {
      ...plugin.services,
      email: {
        send: async () => {},
      },
    };
  }

  // Get the original 'send' function
  const originalSend = plugin.services.email.send;

  // Override the 'send' function
  plugin.services.email.send = async (options) => {
    const { to, from, replyTo, subject, text, html } = options;
    const powerAutomateUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;

    // --- Power Automate Interception ---
    // Check if this is our magic link email AND the webhook URL is set
    if (subject === MAGIC_LINK_SUBJECT && powerAutomateUrl) {
      strapi.log.info(`Intercepting magic link email for: ${to}`);
      try {
        // Send to Power Automate instead
        await axios.post(powerAutomateUrl, {
          to: to,
          subject: subject,
          htmlBody: html,
        });

        strapi.log.info(`Successfully sent magic link via Power Automate.`);
        return { success: true }; // Return a success response

      } catch (err) {
        strapi.log.error(`Power Automate send failed:`, err.message);
        // Throw an error so the magic-link plugin knows it failed
        throw new Error(`Power Automate send failed: ${err.message}`);
      }
    }

    // --- Standard Email (Fallback) ---
    // If it's not a magic link, just log it. We have no other emailer configured.
    strapi.log.warn(`Standard email for "${subject}" was not sent. No default provider.`);
    // We return success so Strapi doesn't crash, but no email is sent.
    return { success: true };
  };

  return plugin;
};

