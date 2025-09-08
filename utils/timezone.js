// UK Timezone utility functions
// UK uses GMT (UTC+0) in winter and BST (UTC+1) in summer

/**
 * Get current UK time
 * @returns {Date} Current time in UK timezone
 */
export function getUKTime() {
    return new Date().toLocaleString("en-GB", {timeZone: "Europe/London"});
}

/**
 * Get UK date object
 * @returns {Date} Date object adjusted for UK timezone
 */
export function getUKDate() {
    const now = new Date();
    const ukTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
    return ukTime;
}

/**
 * Get start of day in UK timezone
 * @param {Date} date - Optional date, defaults to today
 * @returns {Date} Start of day in UK timezone
 */
export function getUKStartOfDay(date = null) {
    const ukDate = date ? new Date(date.toLocaleString("en-US", {timeZone: "Europe/London"})) : getUKDate();
    ukDate.setHours(0, 0, 0, 0);
    return ukDate;
}

/**
 * Get end of day in UK timezone
 * @param {Date} date - Optional date, defaults to today
 * @returns {Date} End of day in UK timezone
 */
export function getUKEndOfDay(date = null) {
    const ukDate = date ? new Date(date.toLocaleString("en-US", {timeZone: "Europe/London"})) : getUKDate();
    ukDate.setHours(23, 59, 59, 999);
    return ukDate;
}

/**
 * Check if a date is today in UK timezone
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today in UK timezone
 */
export function isUKToday(date) {
    const ukToday = getUKStartOfDay();
    const ukDate = getUKStartOfDay(date);
    return ukToday.getTime() === ukDate.getTime();
}

/**
 * Format date for UK timezone
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string in UK timezone
 */
export function formatUKDate(date) {
    return date.toLocaleString("en-GB", {timeZone: "Europe/London"});
}

/**
 * Get UK timezone offset in minutes
 * @returns {number} Timezone offset in minutes
 */
export function getUKTimezoneOffset() {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const ukTime = new Date(utc.toLocaleString("en-US", {timeZone: "Europe/London"}));
    return (ukTime.getTime() - utc.getTime()) / 60000;
}
