export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convert seconds to milliseconds
 * @param {number} seconds
 * @returns {number}
 */
export function toMS(seconds) {
  return seconds * 1000;
}

/**
 * Convert milliseconds to seconds
 * @param {*} ms 
 * @returns 
 */
export function toSeconds(ms) {
  return ms / 1000;
}

/**
 * Get delta time in milliseconds
 * @param {number} before_time
 * @param {number} after_time
 * @returns {number}
 */
export function getDeltaTime(before_time, after_time) {
  return after_time - before_time;
}