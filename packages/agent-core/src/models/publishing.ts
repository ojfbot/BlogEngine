import { z } from 'zod';

/**
 * Publishing platforms supported by BlogEngine
 */
export const PublishingPlatformSchema = z.enum([
  'local_file',
  'hugo',
  'jekyll',
  'github',
  'gitlab',
  'wordpress',
  'medium',
  'devto',
  'hashnode',
]);

export type PublishingPlatform = z.infer<typeof PublishingPlatformSchema>;

/**
 * Publishing target configuration
 */
export const PublishingTargetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  platform: PublishingPlatformSchema,
  config: z.record(z.any()),
  enabled: z.boolean().default(true),
  lastPublishedAt: z.string().datetime().optional(),
});

export type PublishingTarget = z.infer<typeof PublishingTargetSchema>;

/**
 * Publishing status for an article
 */
export const PublishStatusSchema = z.object({
  targetId: z.string().uuid(),
  status: z.enum(['pending', 'in_progress', 'published', 'failed']),
  url: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
  error: z.string().optional(),
});

export type PublishStatus = z.infer<typeof PublishStatusSchema>;

/**
 * Hugo frontmatter configuration
 */
export const HugoConfigSchema = z.object({
  contentDir: z.string().default('content'),
  staticDir: z.string().default('static'),
  archetype: z.string().optional(),
});

export type HugoConfig = z.infer<typeof HugoConfigSchema>;

/**
 * Jekyll frontmatter configuration
 */
export const JekyllConfigSchema = z.object({
  postsDir: z.string().default('_posts'),
  draftsDir: z.string().default('_drafts'),
  layout: z.string().default('post'),
});

export type JekyllConfig = z.infer<typeof JekyllConfigSchema>;

/**
 * GitHub publishing configuration
 */
export const GitHubConfigSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  branch: z.string().default('main'),
  path: z.string().default('content'),
  token: z.string(),
});

export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;

/**
 * WordPress publishing configuration
 */
export const WordPressConfigSchema = z.object({
  url: z.string().url(),
  username: z.string(),
  password: z.string(), // Application password
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type WordPressConfig = z.infer<typeof WordPressConfigSchema>;

/**
 * Medium publishing configuration
 */
export const MediumConfigSchema = z.object({
  token: z.string(),
  publicationId: z.string().optional(),
  publishStatus: z.enum(['public', 'draft', 'unlisted']).default('public'),
});

export type MediumConfig = z.infer<typeof MediumConfigSchema>;

/**
 * Dev.to publishing configuration
 */
export const DevToConfigSchema = z.object({
  apiKey: z.string(),
  organization: z.string().optional(),
  published: z.boolean().default(false),
});

export type DevToConfig = z.infer<typeof DevToConfigSchema>;
