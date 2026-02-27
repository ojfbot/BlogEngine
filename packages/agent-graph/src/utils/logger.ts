/**
 * Logger utility for agent-graph package.
 * Wraps the Pino logger from agent-core with a module prefix.
 */

import { logger as rootLogger } from '@blogengine/agent-core';

export function getLogger(module: string) {
  return rootLogger.child({ module });
}
