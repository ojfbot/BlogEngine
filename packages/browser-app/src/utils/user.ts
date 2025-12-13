import { generateUUID } from './uuid.js';
import { STORAGE_KEYS, USER_ID_PREFIX } from '../constants.js';

/**
 * Get the current user ID from localStorage.
 * If no userId is stored, generates and stores a unique anonymous user ID.
 *
 * Note: This is a temporary solution for MVP. In production, this should
 * be replaced with proper authentication/session management.
 */
export function getUserId(): string {
  const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  if (storedUserId) {
    return storedUserId;
  }

  // Generate unique anonymous user ID for this browser instance
  const anonymousUserId = `${USER_ID_PREFIX}${generateUUID()}`;
  localStorage.setItem(STORAGE_KEYS.USER_ID, anonymousUserId);
  return anonymousUserId;
}

/**
 * Set the user ID in localStorage
 */
export function setUserId(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
}

/**
 * Clear the user ID from localStorage
 */
export function clearUserId(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
}
