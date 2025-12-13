import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from '@blogengine/agent-core';
import threadsRouter from './routes/v2/threads.js';
import chatRouter from './routes/v2/chat.js';
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

// V2 API routes with rate limiting
app.use('/api/v2/threads', generalLimiter, threadsRouter);
app.use('/api/v2/chat', chatLimiter, chatRouter);

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
