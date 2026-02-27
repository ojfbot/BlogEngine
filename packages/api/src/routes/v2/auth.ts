/**
 * Auth routes — POST /api/v2/auth/token
 *
 * Issues a signed JWT for the given userId.
 * Phase B: no credential validation — token issuance only (for dev/testing).
 * Phase C: add real credential check before signing.
 *
 * ⚠️  SECURITY: This endpoint signs a JWT for ANY userId without verifying
 * credentials. It MUST NOT be reachable from an external network until Phase C
 * adds credential verification. Gate with a firewall rule or network policy
 * before any production or staging deployment. See TECHDEBT TD-009.
 */

import { Router, type IRouter } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig, logger } from '@blogengine/agent-core';

const router: IRouter = Router();

router.post('/token', (req, res) => {
  const { userId } = req.body as { userId?: string };
  if (!userId) {
    res.status(400).json({ error: 'userId required' });
    return;
  }

  const config = getConfig();
  const secret = config.jwtSecret;

  if (!secret) {
    logger.error('jwtSecret not configured');
    res.status(500).json({ error: 'Auth not configured — set jwtSecret in env.json' });
    return;
  }

  const token = jwt.sign({ userId }, secret, { expiresIn: '24h' });
  logger.info({ userId }, 'Issued JWT');
  res.json({ token, expiresIn: '24h' });
});

export default router;
