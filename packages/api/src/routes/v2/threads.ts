import { Router, type Request, type Response, type NextFunction } from 'express';
import { threadService } from '../../services/thread-service.js';

const router: Router = Router();

/**
 * GET /api/v2/threads
 * List all threads for a user
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.userId as string | undefined;
    const threads = await threadService.listThreads(userId);
    res.json(threads);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v2/threads
 * Create a new thread
 */
router.post('/', async (req, res, next) => {
  try {
    const { userId, title, metadata } = req.body;
    const thread = await threadService.createThread({ userId, title, metadata });
    res.status(201).json(thread);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v2/threads/:threadId
 * Get a specific thread with its messages
 */
router.get('/:threadId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const threadId = req.params.threadId;
    if (!threadId) {
      res.status(400).json({ error: 'Thread ID is required' });
      return;
    }
    const thread = await threadService.getThread(threadId);
    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }
    res.json(thread);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v2/threads/:threadId
 * Update a thread
 */
router.put('/:threadId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const threadId = req.params.threadId;
    if (!threadId) {
      res.status(400).json({ error: 'Thread ID is required' });
      return;
    }
    const { title, metadata } = req.body;
    const thread = await threadService.updateThread(threadId, { title, metadata });
    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }
    res.json(thread);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v2/threads/:threadId
 * Delete a thread
 */
router.delete('/:threadId', async (req, res, next) => {
  try {
    const { threadId } = req.params;
    await threadService.deleteThread(threadId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v2/threads/:threadId/messages
 * Get messages for a specific thread
 */
router.get('/:threadId/messages', async (req, res, next) => {
  try {
    const { threadId } = req.params;
    const messages = await threadService.getMessages(threadId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

export default router;
