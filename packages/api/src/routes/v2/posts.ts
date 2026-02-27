import { Router } from 'express';
import { threadService } from '../../services/thread-service.js';
import { logger } from '@blogengine/agent-core';

// Post is a sanitised projection of Thread for frame-agent consumption.
// BlogEngineDomainAgent.fetchPosts() calls GET /api/posts — this is what it receives.
// userId is intentionally excluded from the response (security: frame-agent must not
// receive internal user identifiers). This type evolves into a full Post model in Phase D.
export interface Post {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const router: Router = Router();

/**
 * GET /api/posts
 * Returns published posts as a sanitised projection of threads.
 * Called by BlogEngineDomainAgent.fetchPosts() in frame-agent.
 * Phase D: replace with a real posts model backed by the database.
 */
router.get('/', async (_req, res, next) => {
  try {
    // TODO (Phase D): replace with a real posts store — for now project threads as posts
    const threads = await threadService.listThreads();
    const posts: Post[] = threads.map(t => ({
      id: t.threadId,
      title: t.title ?? 'Untitled',
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      // NOTE: userId deliberately excluded — not safe to expose to frame-agent
    }));
    logger.info({ count: posts.length }, 'GET /api/posts');
    res.json({ data: posts });
  } catch (error) {
    next(error);
  }
});

export default router;
