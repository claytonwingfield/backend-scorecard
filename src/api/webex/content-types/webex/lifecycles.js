'use strict';

/**
 * Converts a time string in HH:MM:SS format to seconds.
 */
const timeToSeconds = (time) => {
  if (!time || typeof time !== 'string') {
    return 0;
  }
  const parts = time.split(':');
  if (parts.length !== 3) {
    return 0;
  }
  const [hours, minutes, seconds] = parts.map(part => parseInt(part, 10));
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return 0;
  }
  return (hours * 3600) + (minutes * 60) + seconds;
};

/**
 * Calculates the average handle time in seconds.
 * Returns null if the count is 0 or not provided.
 */
const calculateAverage = (totalTime, count) => {
  // If count is 0, null, or undefined, the average is null.
  if (!count || count === 0) {
    return null;
  }
  const totalSeconds = timeToSeconds(totalTime);
  const average = totalSeconds / count;
  // Round to 2 decimal places
  return Math.round(average * 100) / 100;
};


module.exports = {
  /**
   * Triggered before creating a 'webex' entry.
   */
  beforeCreate(event) {
    const { data } = event.params;

    // Set fields to null if their base values are null/undefined
    if (data.inbound_connected_count === 0) data.inbound_connected_count = null;
    if (data.outbound_connected_count === 0) data.outbound_connected_count = null;
    if (data.total_inbound_handled_time === "00:00:00") data.total_inbound_handled_time = null;
    if (data.total_outbound_handled_time === "00:00:00") data.total_outbound_handled_time = null;

    data.average_inbound_handle_time_seconds = calculateAverage(
      data.total_inbound_handled_time,
      data.inbound_connected_count
    );
    
    data.average_outbound_handle_time_seconds = calculateAverage(
      data.total_outbound_handled_time,
      data.outbound_connected_count
    );
  },

  /**
   * Triggered before updating a 'webex' entry.
   */
  async beforeUpdate(event) {
    const { model, where, data } = event.params;

    // Fetch the full entity being updated to ensure all necessary fields are present
    const existingEntry = await strapi.db.query(model.uid).findOne({ where });

    if (existingEntry) {
      // Create a complete data object by merging existing data with the new updates
      const mergedData = { ...existingEntry, ...data };
      
      // Set fields to null if their base values are null/undefined
      if (data.inbound_connected_count === 0) data.inbound_connected_count = null;
      if (data.outbound_connected_count === 0) data.outbound_connected_count = null;
      if (data.total_inbound_handled_time === "00:00:00") data.total_inbound_handled_time = null;
      if (data.total_outbound_handled_time === "00:00:00") data.total_outbound_handled_time = null;

      data.average_inbound_handle_time_seconds = calculateAverage(
        mergedData.total_inbound_handled_time,
        mergedData.inbound_connected_count
      );

      data.average_outbound_handle_time_seconds = calculateAverage(
        mergedData.total_outbound_handled_time,
        mergedData.outbound_connected_count
      );
    }
  },
};