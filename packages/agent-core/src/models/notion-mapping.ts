import { z } from 'zod';
import { ContentTypeSchema } from './content-types.js';

/**
 * Sync direction for Notion integration
 */
export const SyncDirectionSchema = z.enum([
  'read_only',      // Import from Notion only
  'write_only',     // Export to Notion only
  'bidirectional',  // Two-way sync
]);

export type SyncDirection = z.infer<typeof SyncDirectionSchema>;

/**
 * Notion property mappings
 * Maps Notion database properties to BlogEngine fields
 */
export const NotionPropertyMappingsSchema = z.record(z.string());

export type NotionPropertyMappings = z.infer<typeof NotionPropertyMappingsSchema>;

/**
 * Notion content mapping configuration
 */
export const NotionContentMappingSchema = z.object({
  notionDatabaseId: z.string(),
  contentType: ContentTypeSchema,
  propertyMappings: NotionPropertyMappingsSchema,
  syncDirection: SyncDirectionSchema.default('bidirectional'),
  lastSyncedAt: z.string().datetime().optional(),
  enabled: z.boolean().default(true),
});

export type NotionContentMapping = z.infer<typeof NotionContentMappingSchema>;

/**
 * Notion page metadata
 */
export const NotionPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  properties: z.record(z.any()),
});

export type NotionPage = z.infer<typeof NotionPageSchema>;

/**
 * Notion database metadata
 */
export const NotionDatabaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url().optional(),
  properties: z.record(z.any()),
});

export type NotionDatabase = z.infer<typeof NotionDatabaseSchema>;

/**
 * Sync status
 */
export const SyncStatusSchema = z.object({
  inProgress: z.boolean(),
  lastSyncAt: z.string().datetime().optional(),
  lastError: z.string().optional(),
  itemsSynced: z.number().int().nonnegative().default(0),
});

export type SyncStatus = z.infer<typeof SyncStatusSchema>;
