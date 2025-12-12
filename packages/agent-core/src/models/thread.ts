import { z } from 'zod';

/**
 * Message role schema
 */
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);

export type MessageRole = z.infer<typeof MessageRoleSchema>;

/**
 * Thread message schema
 */
export const ThreadMessageSchema = z.object({
  messageId: z.string().uuid(),
  threadId: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
});

export type ThreadMessage = z.infer<typeof ThreadMessageSchema>;

/**
 * Thread schema
 */
export const ThreadSchema = z.object({
  threadId: z.string().uuid(),
  userId: z.string().optional(),
  title: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Thread = z.infer<typeof ThreadSchema>;

/**
 * Thread with messages schema
 */
export const ThreadWithMessagesSchema = ThreadSchema.extend({
  messages: z.array(ThreadMessageSchema).default([]),
});

export type ThreadWithMessages = z.infer<typeof ThreadWithMessagesSchema>;

/**
 * Chat request schema for streaming
 */
export const ChatRequestSchema = z.object({
  threadId: z.string().uuid().optional(),
  userId: z.string().optional(),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * Chat response schema
 */
export const ChatResponseSchema = z.object({
  messageId: z.string().uuid(),
  threadId: z.string().uuid(),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

/**
 * Stream event types for server-sent events
 */
export const StreamEventTypeSchema = z.enum([
  'start',
  'token',
  'node_start',
  'node_end',
  'error',
  'end',
]);

export type StreamEventType = z.infer<typeof StreamEventTypeSchema>;

/**
 * Stream event schema
 */
export const StreamEventSchema = z.object({
  type: StreamEventTypeSchema,
  data: z.unknown().optional(),
  timestamp: z.string().datetime().optional(),
});

export type StreamEvent = z.infer<typeof StreamEventSchema>;
