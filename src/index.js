'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // ==========================================================
    // THIS IS OUR TEST
    // ==========================================================
    console.log("==========================================================");
    console.log("✅✅✅ TEST LOG: Strapi 'register' function RAN. ✅✅✅");
    console.log("If you see this log, your deploy was SUCCESSFUL.");
    console.log("==========================================================");
    // ==========================================================
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
};
