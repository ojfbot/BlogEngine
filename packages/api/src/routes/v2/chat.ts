import { Router, type Request, type Response, type NextFunction } from 'express';
import { chatService } from '../../services/chat-service.js';
import { logger } from '@blogengine/agent-core';

const router: Router = Router();

/**
 * GET /api/v2/chat/stream
 * Stream chat response using Server-Sent Events
 */
router.get('/stream', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { threadId, userId, message, metadata } = req.query;

    // Validate input BEFORE setting any headers
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Parse and validate metadata BEFORE setting headers
    let parsedMetadata: Record<string, unknown> | undefined;
    if (metadata && typeof metadata === 'string') {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (parseError) {
        logger.error({ parseError, metadata }, 'Failed to parse metadata');
        res.status(400).json({ error: 'Invalid JSON in metadata parameter' });
        return;
      }
    }

    // Now set up SSE headers (after all validation passes)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected' })}\n\n`);

    await chatService.streamChat(
      {
        threadId: threadId as string | undefined,
        userId: userId as string | undefined,
        message: message as string,
        metadata: parsedMetadata,
      },
      {
        onStart: (data) => {
          res.write(`event: start\ndata: ${JSON.stringify(data)}\n\n`);
        },
        onToken: (token) => {
          res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
        },
        onNodeStart: (node) => {
          res.write(`event: node_start\ndata: ${JSON.stringify({ node })}\n\n`);
        },
        onNodeEnd: (node) => {
          res.write(`event: node_end\ndata: ${JSON.stringify({ node })}\n\n`);
        },
        onError: (error) => {
          res.write(`event: error\ndata: ${JSON.stringify({ error })}\n\n`);
        },
        onEnd: () => {
          res.write(`event: end\ndata: ${JSON.stringify({ status: 'complete' })}\n\n`);
          res.end();
        },
      }
    );
  } catch (error) {
    logger.error({ error }, 'Chat stream error');
    res.write(`event: error\ndata: ${JSON.stringify({ error: String(error) })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/v2/chat
 * Send a chat message and get response (non-streaming)
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { threadId, userId, message, metadata } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await chatService.chat({
      threadId,
      userId,
      message,
      metadata,
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
