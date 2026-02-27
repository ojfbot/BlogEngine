/**
 * JWT authentication middleware.
 *
 * When mockAuth=true (development only): injects 'dev-user' as userId without
 * validating a token. Set mockAuth=false (and jwtSecret) before merging Phase C.
 *
 * Phase B merge gate: mockAuth MUST be false in production env.json.
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig, logger } from '@blogengine/agent-core';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const config = getConfig();

  if (config.mockAuth) {
    req.userId = 'dev-user';
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = config.jwtSecret;

  if (!secret) {
    logger.error('jwtSecret not configured — cannot verify JWT');
    res.status(500).json({ error: 'Auth not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.warn({ error }, 'JWT verification failed');
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
