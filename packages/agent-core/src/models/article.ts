import { z } from 'zod';

/**
 * SEO metadata schema
 */
export const SEOMetadataSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
});

export type SEOMetadata = z.infer<typeof SEOMetadataSchema>;

/**
 * Article metadata schema
 */
export const ArticleMetadataSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  author: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  featuredImage: z.string().url().optional(),
  seo: SEOMetadataSchema.optional(),
  readingTime: z.number().int().positive(),
  wordCount: z.number().int().nonnegative(),
});

export type ArticleMetadata = z.infer<typeof ArticleMetadataSchema>;

/**
 * Published URL tracking
 */
export const PublishedUrlSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
  publishedAt: z.string().datetime(),
});

export type PublishedUrl = z.infer<typeof PublishedUrlSchema>;

/**
 * Article content status
 */
export const ArticleStatusSchema = z.enum([
  'draft',
  'review',
  'published',
  'archived',
]);

export type ArticleStatus = z.infer<typeof ArticleStatusSchema>;

/**
 * Article content format
 */
export const ArticleFormatSchema = z.enum([
  'markdown',
  'html',
  'notion',
]);

export type ArticleFormat = z.infer<typeof ArticleFormatSchema>;

/**
 * Complete article content schema
 */
export const ArticleContentSchema = z.object({
  id: z.string().uuid(),
  metadata: ArticleMetadataSchema,
  content: z.string(),
  format: ArticleFormatSchema.default('markdown'),
  status: ArticleStatusSchema.default('draft'),
  version: z.number().int().positive().default(1),
  notionPageId: z.string().optional(),
  publishedUrls: z.array(PublishedUrlSchema).default([]),
});

export type ArticleContent = z.infer<typeof ArticleContentSchema>;
