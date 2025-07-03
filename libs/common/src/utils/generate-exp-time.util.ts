import { addSeconds, formatISO } from 'date-fns';
import { convertToSecondsUtil } from './convert-to-seconds.util';

/**
 * Returns an ISO string representing a date in the future
 * @param timeToAdd a string of the format "1h", "2d", "3w", etc.
 * @returns a string of the format "2022-03-15T12:00:00.000Z"
 */

export function generateExpTime(timeToAdd: string) {
  const seconds = convertToSecondsUtil(timeToAdd);

  const currentTime = new Date();

  const expiresAt = addSeconds(currentTime, seconds);

  return formatISO(expiresAt);
}
