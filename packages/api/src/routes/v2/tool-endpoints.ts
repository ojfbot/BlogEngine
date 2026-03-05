/**
 * Distinct HTTP endpoints for each blogengine tool (ADR-0007 contract).
 *
 * All endpoints delegate to chatService.chat() — the LangGraph graph processes
 * the request. The endpoint path is the semantic discriminator; no message
 * prefixing needed since the caller's intent is already clear from the route.
 *
 * Auth: Bearer JWT required (applied by server.ts, not here).
 * Rate limiting: chatLimiter (applied by server.ts).
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { chatService } from '../../services/chat-service.js';
import { logger } from '@blogengine/agent-core';

const router: Router = Router();

// ── POST /api/v2/draft ────────────────────────────────────────────────────────
// Tool: draft_post — create a new blog post draft from a topic or outline.
// Body: { message: string, threadId?: string, userId?: string }
router.post('/draft', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, threadId, userId } = req.body;
    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    const response = await chatService.chat({ message, threadId, userId });
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'draft_post error');
    next(error);
  }
});

// ── POST /api/v2/posts/edit ───────────────────────────────────────────────────
// Tool: edit_post — edit and improve an existing draft.
// Body: { message: string, threadId: string, userId?: string }
// threadId required — identifies the draft to edit.
router.post('/posts/edit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, threadId, userId } = req.body;
    if (!message || !threadId) {
      res.status(400).json({ error: 'message and threadId are required' });
      return;
    }
    const response = await chatService.chat({ message, threadId, userId });
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'edit_post error');
    next(error);
  }
});

// ── POST /api/v2/posts/publish ────────────────────────────────────────────────
// Tool: publish_post — move a draft through the publishing pipeline.
// Body: { message: string, threadId: string, userId?: string }
// threadId required — identifies the draft to publish.
router.post('/posts/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, threadId, userId } = req.body;
    if (!message || !threadId) {
      res.status(400).json({ error: 'message and threadId are required' });
      return;
    }
    const response = await chatService.chat({ message, threadId, userId });
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'publish_post error');
    next(error);
  }
});

// ── POST /api/v2/notion/sync ──────────────────────────────────────────────────
// Tool: notion_sync — sync content with Notion workspace.
// Body: { message: string, threadId?: string, userId?: string }
router.post('/notion/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, threadId, userId } = req.body;
    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    const response = await chatService.chat({ message, threadId, userId });
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'notion_sync error');
    next(error);
  }
});

// ── POST /api/v2/podcast/notes ────────────────────────────────────────────────
// Tool: podcast_notes — generate show notes and episode summary.
// Body: { message: string, threadId?: string, userId?: string }
router.post('/podcast/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, threadId, userId } = req.body;
    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    const response = await chatService.chat({ message, threadId, userId });
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'podcast_notes error');
    next(error);
  }
});

// ── POST /api/v2/content/strategy ─────────────────────────────────────────────
// Tool: content_strategy — generate topic ideas and editorial calendar.
// Body: { message: string, threadId?: string, userId?: string }
router.post('/content/strategy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, threadId, userId } = req.body;
    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    const response = await chatService.chat({ message, threadId, userId });
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'content_strategy error');
    next(error);
  }
});

export default router;
