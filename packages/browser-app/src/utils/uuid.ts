/**
 * Generate a UUID v4
 * Uses crypto.randomUUID() if available, otherwise falls back to a polyfill
 */
export function generateUUID(): string {
  // Check if crypto.randomUUID is available (modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback implementation for older environments
  // Based on RFC4122 version 4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
