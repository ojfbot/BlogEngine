/**
 * SQLite Checkpoint Saver for BlogEngine
 *
 * Adapted from cv-builder's SQLiteCheckpointer. Stores LangGraph state at
 * each node execution, enabling:
 *   - Cross-restart conversation continuity
 *   - Thread resumption from any checkpoint
 *   - Time-travel debugging
 *
 * NOTE: Single-process only (SQLite write lock). Phase C migrates to
 * PostgreSQL for multi-user concurrent access.
 *
 * DB file: ./blogengine.db (same file will also hold thread store in Phase C)
 */

import {
  BaseCheckpointSaver,
  type Checkpoint,
  type CheckpointMetadata,
  type CheckpointTuple,
} from '@langchain/langgraph';
import type { RunnableConfig } from '@langchain/core/runnables';
import Database from 'better-sqlite3';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('checkpointer');

interface CheckpointRow {
  thread_id: string;
  thread_ts: string;
  parent_ts: string | null;
  checkpoint: string;  // JSON
  metadata: string;    // JSON
}

export class SQLiteCheckpointer extends BaseCheckpointSaver {
  private db: Database.Database;

  constructor(dbPath = './blogengine.db') {
    super();
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');  // better concurrent reads
    this.initSchema();
    logger.info({ dbPath }, 'SQLiteCheckpointer initialized');
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS checkpoints (
        thread_id  TEXT NOT NULL,
        thread_ts  TEXT NOT NULL,
        parent_ts  TEXT,
        checkpoint TEXT NOT NULL,
        metadata   TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (thread_id, thread_ts)
      );
      CREATE INDEX IF NOT EXISTS idx_cp_thread ON checkpoints(thread_id);
    `);
    logger.debug('Checkpoint schema ready');
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const { thread_id, thread_ts } = config.configurable ?? {};
    if (!thread_id) return undefined;

    const row = thread_ts
      ? (this.db
          .prepare('SELECT * FROM checkpoints WHERE thread_id = ? AND thread_ts = ? LIMIT 1')
          .get(thread_id, thread_ts) as CheckpointRow | undefined)
      : (this.db
          .prepare('SELECT * FROM checkpoints WHERE thread_id = ? ORDER BY thread_ts DESC LIMIT 1')
          .get(thread_id) as CheckpointRow | undefined);

    if (!row) return undefined;

    return {
      config: { configurable: { thread_id: row.thread_id, thread_ts: row.thread_ts } },
      checkpoint: JSON.parse(row.checkpoint) as Checkpoint,
      metadata: JSON.parse(row.metadata) as CheckpointMetadata,
      parentConfig: row.parent_ts
        ? { configurable: { thread_id: row.thread_id, thread_ts: row.parent_ts } }
        : undefined,
    };
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
    _newVersions: Parameters<BaseCheckpointSaver['put']>[3]
  ): Promise<RunnableConfig> {
    const { thread_id } = config.configurable ?? {};
    if (!thread_id) throw new Error('thread_id required to save checkpoint');

    const thread_ts = new Date().toISOString();
    const parent_ts = (config.configurable?.thread_ts as string | undefined) ?? null;

    this.db
      .prepare(
        `INSERT OR REPLACE INTO checkpoints (thread_id, thread_ts, parent_ts, checkpoint, metadata)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(thread_id, thread_ts, parent_ts, JSON.stringify(checkpoint), JSON.stringify(metadata));

    logger.debug({ thread_id, thread_ts }, 'Checkpoint saved');
    return { configurable: { thread_id, thread_ts } };
  }

  async *list(config: RunnableConfig): AsyncGenerator<CheckpointTuple> {
    const { thread_id } = config.configurable ?? {};
    if (!thread_id) return;

    const rows = this.db
      .prepare('SELECT * FROM checkpoints WHERE thread_id = ? ORDER BY thread_ts DESC')
      .all(thread_id) as CheckpointRow[];

    for (const row of rows) {
      yield {
        config: { configurable: { thread_id: row.thread_id, thread_ts: row.thread_ts } },
        checkpoint: JSON.parse(row.checkpoint) as Checkpoint,
        metadata: JSON.parse(row.metadata) as CheckpointMetadata,
        parentConfig: row.parent_ts
          ? { configurable: { thread_id: row.thread_id, thread_ts: row.parent_ts } }
          : undefined,
      };
    }
  }

  async putWrites(
    _config: RunnableConfig,
    _writes: Parameters<BaseCheckpointSaver['putWrites']>[1],
    _taskId: string
  ): Promise<void> {
    // Intermediate writes not persisted — acceptable for single-process dev.
    // Phase C: implement for production durability.
  }

  close(): void {
    this.db.close();
    logger.info('SQLiteCheckpointer closed');
  }
}

export function createSQLiteCheckpointer(dbPath?: string): SQLiteCheckpointer {
  return new SQLiteCheckpointer(dbPath);
}
