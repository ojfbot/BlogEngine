/**
 * Get the current user ID from localStorage.
 * If no userId is stored, sets and returns a default 'browser-user' ID.
 *
 * Note: This is a temporary solution for MVP. In production, this should
 * be replaced with proper authentication/session management.
 */
export function getUserId(): string {
  const storedUserId = localStorage.getItem('userId');

  if (storedUserId) {
    return storedUserId;
  }

  // Default user ID for dev/demo purposes
  const defaultUserId = 'browser-user';
  localStorage.setItem('userId', defaultUserId);
  return defaultUserId;
}

/**
 * Set the user ID in localStorage
 */
export function setUserId(userId: string): void {
  localStorage.setItem('userId', userId);
}

/**
 * Clear the user ID from localStorage
 */
export function clearUserId(): void {
  localStorage.removeItem('userId');
}
