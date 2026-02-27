import { Router } from 'express';

const router: Router = Router();

/**
 * GET /api/tools
 *
 * Returns the capability manifest for blogengine-api.
 * Used by frame-agent to discover available domain tools.
 * No auth required — public discovery endpoint.
 */
router.get('/', (_req, res) => {
  res.json({
    service: 'blogengine',
    version: '1.0.0',
    description: 'AI-powered blog creation and content management',
    tools: [
      {
        name: 'draft_post',
        endpoint: 'POST /api/v2/chat',
        description: 'Draft a new blog post from a topic or outline',
        input: { message: 'string', threadId: 'string (optional)' },
        deprecated: false,
      },
      {
        name: 'edit_post',
        endpoint: 'POST /api/v2/chat',
        description: 'Edit and improve an existing draft',
        input: { message: 'string', threadId: 'string (optional)' },
        deprecated: false,
      },
      {
        name: 'publish_post',
        endpoint: 'POST /api/v2/chat',
        description: 'Move a draft through the publishing pipeline',
        input: { message: 'string', threadId: 'string (optional)' },
        deprecated: false,
      },
      {
        name: 'notion_sync',
        endpoint: 'POST /api/v2/chat',
        description: 'Sync content with Notion workspace',
        input: { message: 'string', threadId: 'string (optional)' },
        deprecated: false,
      },
      {
        name: 'podcast_notes',
        endpoint: 'POST /api/v2/chat',
        description: 'Generate show notes and episode summary for a podcast episode',
        input: { message: 'string', threadId: 'string (optional)' },
        deprecated: false,
      },
      {
        name: 'content_strategy',
        endpoint: 'POST /api/v2/chat',
        description: 'Generate topic ideas and editorial calendar',
        input: { message: 'string', threadId: 'string (optional)' },
        deprecated: false,
      },
    ],
    dataEndpoints: {
      posts: 'GET /api/posts',
      threads: 'GET /api/v2/threads',
      auth: 'POST /api/v2/auth/token',
    },
  });
});

export default router;
