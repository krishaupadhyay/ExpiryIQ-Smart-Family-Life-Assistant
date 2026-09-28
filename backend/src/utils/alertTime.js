// utils/alertTime.js
// Shared helper: makes sure an alert time is a valid 24-hour "HH:mm" string.

const ALERT_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function cleanAlertTime(value, fallback = '08:00') {
  return typeof value === 'string' && ALERT_TIME_REGEX.test(value) ? value : fallback;
}

module.exports = { cleanAlertTime, ALERT_TIME_REGEX };
