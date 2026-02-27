import pino from 'pino';

/**
 * Create a logger instance with consistent configuration
 */
export function createLogger(name: string) {
  return pino({
    name,
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  });
}

/**
 * Default logger instance
 */
export const logger = createLogger('blogengine');
