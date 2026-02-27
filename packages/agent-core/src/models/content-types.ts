import { z } from 'zod';

/**
 * Content types supported by BlogEngine
 */
export const ContentTypeSchema = z.enum([
  'blog_article',      // Narrative, opinion, announcements
  'tutorial',          // Step-by-step guides with code
  'documentation',     // Technical docs, API references
  'release_notes',     // Version updates, changelogs
  'readme',            // Project READMEs
  'case_study',        // Customer stories, examples
]);

export type ContentType = z.infer<typeof ContentTypeSchema>;
