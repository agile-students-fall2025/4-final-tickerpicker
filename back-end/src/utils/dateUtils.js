/**
 * Date utility functions for parsing and formatting dates
 * Used across the application for consistent date handling
 */

/**
 * Converts a date string (YYYY-MM-DD) to a Date object at start of day (UTC)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} Date object at start of day in UTC
 */
export function parseDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00.000Z");
  return date;
}

/**
 * Converts a Date object to YYYY-MM-DD string
 * @param {Date} date - Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
