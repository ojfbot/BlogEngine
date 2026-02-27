import { z } from 'zod';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from repo root.
// Depth: packages/agent-core/src/utils/ (src) or packages/agent-core/dist/utils/ (dist) → 4 levels up.
// If the package is relocated, update this count to match.
dotenvConfig({ path: join(__dirname, '../../../../.env.local') });

/**
 * Directory configuration schema
 */
const DirectoriesSchema = z.object({
  content: z.string().default('content'),
  drafts: z.string().default('drafts'),
  published: z.string().default('published'),
  research: z.string().default('research'),
  exports: z.string().default('exports'),
  temp: z.string().default('temp'),
});

/**
 * Database configuration schema
 */
const DatabaseConfigSchema = z.object({
  type: z.enum(['sqlite', 'postgres']).default('sqlite'),
  path: z.string().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

/**
 * RAG configuration schema
 */
const RAGConfigSchema = z.object({
  provider: z.enum(['pinecone', 'chroma', 'faiss']).default('pinecone'),
  embeddingModel: z.string().default('text-embedding-3-small'),
  chunkSize: z.number().int().positive().default(1000),
  chunkOverlap: z.number().int().nonnegative().default(200),
});

/**
 * Main environment configuration schema
 */
const EnvJsonSchema = z.object({
  // AI API Keys
  anthropicApiKey: z.string().min(1),
  openaiApiKey: z.string().min(1),

  // Integration API Keys
  notionApiKey: z.string().optional(),
  githubToken: z.string().optional(),
  wordpressUrl: z.string().url().optional(),
  wordpressUsername: z.string().optional(),
  wordpressPassword: z.string().optional(),
  mediumToken: z.string().optional(),
  devtoApiKey: z.string().optional(),
  tavilyApiKey: z.string().optional(),

  // Vector store
  pineconeApiKey: z.string().optional(),
  pineconeEnvironment: z.string().optional(),
  pineconeIndex: z.string().optional(),

  // Directories
  directories: DirectoriesSchema.default({}),

  // Auth
  jwtSecret: z.string().optional(),
  // Phase B merge gate: mockAuth MUST be false in production. See ADR: Phase B auth gate.
  mockAuth: z.boolean().default(false),

  // Model configuration
  model: z.string().default('claude-sonnet-4-20250514'),
  temperature: z.number().min(0).max(2).default(0.7),

  // Database
  database: DatabaseConfigSchema.default({}),

  // RAG
  rag: RAGConfigSchema.default({}),
});

export type EnvJson = z.infer<typeof EnvJsonSchema>;

/**
 * Configuration singleton
 */
class Config {
  private static instance: Config | null = null;
  private config: EnvJson | null = null;

  private constructor() {}

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Load configuration from env.json or environment variables
   */
  load(): EnvJson {
    if (this.config) {
      return this.config;
    }

    // Try to load from env.json first (highest priority)
    const envJsonPath = join(__dirname, '../../env.json');

    if (existsSync(envJsonPath)) {
      try {
        const rawConfig = JSON.parse(readFileSync(envJsonPath, 'utf-8'));
        this.config = EnvJsonSchema.parse(rawConfig);
        logger.info('Configuration loaded from env.json');
        return this.config;
      } catch (error) {
        logger.error({ error }, 'Failed to parse env.json');
        throw error;
      }
    }

    // Fallback to environment variables
    try {
      this.config = EnvJsonSchema.parse({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        notionApiKey: process.env.NOTION_API_KEY,
        githubToken: process.env.GITHUB_TOKEN,
        wordpressUrl: process.env.WORDPRESS_URL,
        wordpressUsername: process.env.WORDPRESS_USERNAME,
        wordpressPassword: process.env.WORDPRESS_PASSWORD,
        mediumToken: process.env.MEDIUM_TOKEN,
        devtoApiKey: process.env.DEVTO_API_KEY,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        pineconeApiKey: process.env.PINECONE_API_KEY,
        pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
        pineconeIndex: process.env.PINECONE_INDEX,
        jwtSecret: process.env.JWT_SECRET,
        mockAuth: process.env.MOCK_AUTH === 'true',
        model: process.env.MODEL,
        temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : undefined,
        directories: {},
        database: {
          type: (process.env.DATABASE_TYPE as 'sqlite' | 'postgres') || 'sqlite',
          path: process.env.DATABASE_PATH,
        },
        rag: {},
      });
      logger.info('Configuration loaded from environment variables');
      return this.config;
    } catch (error) {
      logger.error({ error }, 'Failed to load configuration from environment');
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  get(): EnvJson {
    if (!this.config) {
      return this.load();
    }
    return this.config;
  }

  /**
   * Reset configuration (useful for testing)
   */
  reset() {
    this.config = null;
  }
}

/**
 * Get configuration instance
 */
export function getConfig(): EnvJson {
  return Config.getInstance().get();
}

/**
 * Load configuration
 */
export function loadConfig(): EnvJson {
  return Config.getInstance().load();
}

/**
 * Reset configuration
 */
export function resetConfig() {
  Config.getInstance().reset();
}
