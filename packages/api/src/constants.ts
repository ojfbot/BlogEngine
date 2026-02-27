/**
 * API Constants
 * Centralized configuration values for the BlogEngine API
 */

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes in milliseconds
  GENERAL_MAX_REQUESTS: 100, // General API endpoints limit
  CHAT_MAX_REQUESTS: 30, // Chat endpoints limit (more restrictive due to resource intensity)
} as const;

// Validation Limits
export const VALIDATION_LIMITS = {
  USER_ID_MAX_LENGTH: 100,
  THREAD_TITLE_MIN_LENGTH: 1,
  THREAD_TITLE_MAX_LENGTH: 200,
  MESSAGE_MIN_LENGTH: 1,
} as const;

// Server Configuration
// Port 3006 matches frame-agent's BLOGENGINE_API_URL default (http://localhost:3006).
// Port layout: cv-builder=3001, BlogEngine=3006, TripPlanner=3011.
export const SERVER = {
  DEFAULT_PORT: 3006,
  DEFAULT_CORS_ORIGIN: 'http://localhost:3005',
} as const;
