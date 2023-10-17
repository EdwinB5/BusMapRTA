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