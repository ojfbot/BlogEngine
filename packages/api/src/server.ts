import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from '@blogengine/agent-core';
import threadsRouter from './routes/v2/threads.js';
import chatRouter from './routes/v2/chat.js';
import authRouter from './routes/v2/auth.js';
import postsRouter from './routes/v2/posts.js';
import toolsRouter from './routes/tools.js';
import { requireAuth } from './middleware/auth.js';
import { RATE_LIMIT, SERVER } from './constants.js';

const app = express();
const PORT = process.env.PORT || SERVER.DEFAULT_PORT;

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.GENERAL_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, 'Rate limit exceeded');
    res.status(429).json({
      error: 'Too many requests, please try again later',
    });
  },
});

const chatLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.CHAT_MAX_REQUESTS,
  message: 'Too many chat requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, 'Chat rate limit exceeded');
    res.status(429).json({
      error: 'Too many chat requests, please try again later',
    });
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || SERVER.DEFAULT_CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
  }, 'Incoming request');
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Capability manifest — rate-limited, no auth required
app.use('/api/tools', generalLimiter, toolsRouter);

// Auth endpoint — no JWT required to issue a token
app.use('/api/v2/auth', generalLimiter, authRouter);

// V2 API routes — JWT required
app.use('/api/v2/threads', generalLimiter, requireAuth, threadsRouter);
app.use('/api/v2/chat', chatLimiter, requireAuth, chatRouter);

// Posts endpoint — called by BlogEngineDomainAgent.fetchPosts() in frame-agent.
// Mounted at /api/posts (not /api/v2/posts) to match frame-agent's hardcoded path.
// requireAuth: frame-agent must send a Bearer token. Use mockAuth=true locally until
// frame-agent is updated to pass its service JWT (Phase C — see TECHDEBT TD-016).
app.use('/api/posts', generalLimiter, requireAuth, postsRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err, path: req.path }, 'Request error');
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'BlogEngine API server started');
  console.log(`\n🚀 BlogEngine API server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
