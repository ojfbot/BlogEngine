import { Router } from 'express';
import { createRequire } from 'module';

// Read version from package.json at startup — avoids hardcoded drift.
const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

const router: Router = Router();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InputSchema {
  type: 'object';
  properties: Record<string, { type: string; description: string }>;
  required: string[];
}

export interface ToolEntry {
  name: string;
  endpoint: string;
  description: string;
  /** Bearer — all tools require `Authorization: Bearer <token>` */
  auth: 'Bearer';
  /** JSON Schema describing the POST /api/v2/chat body fields for this tool */
  input: InputSchema;
}

export interface CapabilityManifest {
  service: string;
  version: string;
  description: string;
  /**
   * All tools currently dispatch to POST /api/v2/chat. The orchestrator routes
   * by intent inferred from `message`. The tool `name` is the implicit
   * discriminator — frame-agent should include it in the message so that
   * conversation history is attributable to a specific tool invocation.
   */
  tools: ToolEntry[];
  /**
   * Data endpoints — read-only resource access.
   * NOTE: the auth token endpoint (POST /api/v2/auth/token) is intentionally
   * omitted here. It must not be advertised publicly until Phase C adds
   * credential verification (see TECHDEBT TD-009).
   */
  dataEndpoints: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Manifest (exported so it can be tested without HTTP)
// ---------------------------------------------------------------------------

export const capabilityManifest: CapabilityManifest = {
  service: 'blogengine',
  version,
  description: 'AI-powered blog creation and content management',
  tools: [
    {
      name: 'draft_post',
      endpoint: 'POST /api/v2/chat',
      auth: 'Bearer',
      description: 'Draft a new blog post from a topic or outline',
      input: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Topic, outline, or brief for the post' },
          threadId: { type: 'string', description: 'Existing thread ID to continue' },
        },
        required: ['message'],
      },
    },
    {
      name: 'edit_post',
      endpoint: 'POST /api/v2/chat',
      auth: 'Bearer',
      description: 'Edit and improve an existing draft',
      input: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Edit instructions' },
          threadId: { type: 'string', description: 'Thread ID of the draft to edit' },
        },
        required: ['message', 'threadId'],
      },
    },
    {
      name: 'publish_post',
      endpoint: 'POST /api/v2/chat',
      auth: 'Bearer',
      description: 'Move a draft through the publishing pipeline',
      input: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Publishing instructions or target platform' },
          threadId: { type: 'string', description: 'Thread ID of the draft to publish' },
        },
        required: ['message', 'threadId'],
      },
    },
    {
      name: 'notion_sync',
      endpoint: 'POST /api/v2/chat',
      auth: 'Bearer',
      description: 'Sync content with Notion workspace',
      input: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Sync instructions or target Notion database' },
          threadId: { type: 'string', description: 'Existing thread ID to continue' },
        },
        required: ['message'],
      },
    },
    {
      name: 'podcast_notes',
      endpoint: 'POST /api/v2/chat',
      auth: 'Bearer',
      description: 'Generate show notes and episode summary for a podcast episode',
      input: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Podcast episode URL, title, or transcript' },
          threadId: { type: 'string', description: 'Existing thread ID to continue' },
        },
        required: ['message'],
      },
    },
    {
      name: 'content_strategy',
      endpoint: 'POST /api/v2/chat',
      auth: 'Bearer',
      description: 'Generate topic ideas and editorial calendar',
      input: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Goals, audience, or time period for the calendar' },
          threadId: { type: 'string', description: 'Existing thread ID to continue' },
        },
        required: ['message'],
      },
    },
  ],
  dataEndpoints: {
    posts: 'GET /api/posts',
    threads: 'GET /api/v2/threads',
  },
};

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

/**
 * GET /api/tools
 *
 * Returns the capability manifest for blogengine-api.
 * Used by frame-agent to discover available domain tools.
 * Rate-limited but no auth required — public discovery endpoint.
 */
router.get('/', (_req, res) => {
  res.json(capabilityManifest);
});

export default router;
