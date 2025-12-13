import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { threadService } from '../../services/thread-service.js';
import { logger } from '@blogengine/agent-core';
import { VALIDATION_LIMITS } from '../../constants.js';

// Validation schemas for API requests
const CreateThreadRequestSchema = z.object({
  userId: z.string().min(1).max(VALIDATION_LIMITS.USER_ID_MAX_LENGTH).optional(),
  title: z.string().min(VALIDATION_LIMITS.THREAD_TITLE_MIN_LENGTH).max(VALIDATION_LIMITS.THREAD_TITLE_MAX_LENGTH).optional(),
  metadata: z.record(z.unknown()).optional(),
}).strict();

const UpdateThreadRequestSchema = z.object({
  title: z.string().min(VALIDATION_LIMITS.THREAD_TITLE_MIN_LENGTH).max(VALIDATION_LIMITS.THREAD_TITLE_MAX_LENGTH).optional(),
  metadata: z.record(z.unknown()).optional(),
}).strict();

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
    // Validate request body
    const validationResult = CreateThreadRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.error({ error: validationResult.error, body: req.body }, 'Invalid create thread request');
      res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    const { userId, title, metadata } = validationResult.data;
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

    // Validate request body
    const validationResult = UpdateThreadRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.error({ error: validationResult.error, body: req.body }, 'Invalid update thread request');
      res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    const { title, metadata } = validationResult.data;
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
