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

export function SecondsToHours(seconds) {
  return seconds / 3600;
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

/**
 * From KM/H to M/S
 * @param {*} kmh 
 * @returns 
 */
export function KMHtoMS(kmh) {
  return kmh / 3.6;
}
/**
 * 
 * @param {*} distance 
 * @param {*} speed 
 * @returns 
 */
export function getTime(distance, speed) {
  return distance / speed;
}

export function getDistance(speed, time) {
  return speed * time; 
}

export function MtoKm(distance) {
  return distance / 1000;
}

export function KmToM(distance) {
  return distance * 1000;

}