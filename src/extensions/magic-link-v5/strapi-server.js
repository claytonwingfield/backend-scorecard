"use strict";

module.exports = (plugin) => {
  // Get the original controller
  // Note: We are guessing the controller is named 'auth'.
  // See the "Important Note" below if this doesn't work.
  const originalController = plugin.controllers.auth;

  // Override the 'sendLink' action
  plugin.controllers.auth = {
    ...originalController, // Keep all other original actions

    async sendLink(ctx) {
      // 1. Get email from the request body
      const { email } = ctx.request.body;

      if (!email) {
        return ctx.badRequest("Email is required.");
      }

      const lowercaseEmail = email.toLowerCase();

      try {
        // 2. Check if email exists in the 'staff' content type
        const staffMember = await strapi.db.query("api::staff.staff").findOne({
          where: { email: lowercaseEmail },
        });

        // 3. If staff member does NOT exist, do not proceed.
        // We send a generic 200 OK response. This is a security best practice
        // to prevent attackers from "fishing" for valid staff emails.
        if (!staffMember) {
          strapi.log.warn(`Magic-link: Blocked login attempt for non-staff email: ${email}`);
          return ctx.send({
            ok: true,
            message: "If your email is registered with us, you will receive a login link."
          });
        }

        // 4. If staff member EXISTS, log it and call the original plugin action
        strapi.log.info(`Magic-link: Sending link to staff member: ${email}`);
        
        // Use 'call' to maintain the correct 'this' context for the original controller
        return await originalController.sendLink.call(this, ctx);

      } catch (err) {
        strapi.log.error("Error in custom magic-link sendLink override:", err);
        return ctx.internalServerError("An error occurred while trying to send the login link.");
      }
    },
  };

  return plugin;
};
