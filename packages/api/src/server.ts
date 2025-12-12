import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@blogengine/agent-core';
import threadsRouter from './routes/v2/threads.js';
import chatRouter from './routes/v2/chat.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3005',
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

// V2 API routes
app.use('/api/v2/threads', threadsRouter);
app.use('/api/v2/chat', chatRouter);

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
