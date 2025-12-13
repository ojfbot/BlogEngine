/**
 * Browser App Constants
 * Centralized configuration values for the BlogEngine browser application
 */

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_ID: 'userId',
  ANTHROPIC_API_KEY: 'blogengine_anthropic_api_key',
  OPENAI_API_KEY: 'blogengine_openai_api_key',
  NOTION_API_KEY: 'blogengine_notion_api_key',
  AUTO_SAVE: 'blogengine_auto_save',
  SEO_SUGGESTIONS: 'blogengine_seo_suggestions',
} as const;

// User ID Prefix
export const USER_ID_PREFIX = 'anon-' as const;
