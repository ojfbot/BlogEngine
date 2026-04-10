import { Router } from 'express';
import { threadService } from '../services/thread-service.js';
import { mapThreadToBead } from '../beads/mapper.js';
import type { BlogBeadStatus } from '../beads/types.js';

const router: Router = Router();

/**
 * GET /api/beads
 *
 * Returns all threads mapped to the FrameBeadLike shape (ADR-0016).
 * Read-only projection — Mayor/frame-agent aggregation endpoint.
 *
 * Query params:
 *   status — filter by bead status: "created" | "live" | "closed" | "archived"
 */
router.get('/', async (_req, res, next) => {
  try {
    const threads = await threadService.listThreads();
    let beads = threads.map(mapThreadToBead);

    const statusParam = _req.query.status as string | undefined;
    if (statusParam) {
      const valid: BlogBeadStatus[] = ['created', 'live', 'closed', 'archived'];
      if (!valid.includes(statusParam as BlogBeadStatus)) {
        res.status(400).json({ error: `Invalid status. Must be one of: ${valid.join(', ')}` });
        return;
      }
      beads = beads.filter(b => b.status === statusParam);
    }

    res.json({ beads, count: beads.length });
  } catch (error) {
    next(error);
  }
});

export default router;
