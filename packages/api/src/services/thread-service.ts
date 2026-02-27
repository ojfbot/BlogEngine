import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  Thread,
  ThreadWithMessages,
  ThreadMessage,
} from '@blogengine/agent-core';
import { logger } from '@blogengine/agent-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// .data/ sits at the package root (packages/api/.data/threads.json)
const DATA_DIR = join(__dirname, '../../.data');
const THREADS_FILE = join(DATA_DIR, 'threads.json');

type ThreadStore = Record<string, ThreadWithMessages>;

/**
 * File-backed thread storage.
 * Reads/writes .data/threads.json on every mutation.
 * Suitable for single-process development; replace with a DB for multi-process.
 */
class ThreadService {
  private threads: Map<string, ThreadWithMessages>;

  constructor() {
    this.threads = new Map(Object.entries(this.load()));
  }

  // ---- Persistence helpers ----

  private load(): ThreadStore {
    if (!existsSync(THREADS_FILE)) return {};
    try {
      return JSON.parse(readFileSync(THREADS_FILE, 'utf-8')) as ThreadStore;
    } catch (error) {
      logger.error({ error }, 'Failed to load threads.json — starting fresh');
      return {};
    }
  }

  private persist(): void {
    try {
      if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
      const store: ThreadStore = Object.fromEntries(this.threads.entries());
      writeFileSync(THREADS_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (error) {
      logger.error({ error }, 'Failed to persist threads.json');
    }
  }

  // ---- Public API ----

  async createThread(params: {
    userId?: string;
    title?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Thread> {
    const threadId = randomUUID();
    const now = new Date().toISOString();

    const thread: Thread = {
      threadId,
      userId: params.userId,
      title: params.title || 'New conversation',
      metadata: params.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.threads.set(threadId, { ...thread, messages: [] });
    this.persist();
    return thread;
  }

  async listThreads(userId?: string): Promise<Thread[]> {
    const allThreads = Array.from(this.threads.values());
    const filtered = userId
      ? allThreads.filter(t => t.userId === userId)
      : allThreads;
    return filtered
      .map(({ messages: _m, ...thread }) => thread)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getThread(threadId: string): Promise<ThreadWithMessages | null> {
    return this.threads.get(threadId) ?? null;
  }

  async updateThread(
    threadId: string,
    updates: { title?: string; metadata?: Record<string, unknown> }
  ): Promise<Thread | null> {
    const thread = this.threads.get(threadId);
    if (!thread) return null;

    const updated: ThreadWithMessages = {
      ...thread,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.threads.set(threadId, updated);
    this.persist();
    const { messages: _m, ...threadData } = updated;
    return threadData;
  }

  async deleteThread(threadId: string): Promise<void> {
    this.threads.delete(threadId);
    this.persist();
  }

  async getMessages(threadId: string): Promise<ThreadMessage[]> {
    return this.threads.get(threadId)?.messages ?? [];
  }

  async addMessage(
    threadId: string,
    message: Omit<ThreadMessage, 'messageId' | 'threadId' | 'createdAt'>
  ): Promise<ThreadMessage> {
    const thread = this.threads.get(threadId);
    if (!thread) throw new Error('Thread not found');

    const newMessage: ThreadMessage = {
      messageId: randomUUID(),
      threadId,
      role: message.role,
      content: message.content,
      metadata: message.metadata,
      createdAt: new Date().toISOString(),
    };

    const updatedThread: ThreadWithMessages = {
      ...thread,
      messages: [...thread.messages, newMessage],
      updatedAt: newMessage.createdAt,
    };
    this.threads.set(threadId, updatedThread);
    this.persist();
    return newMessage;
  }
}

// Export singleton instance
export const threadService = new ThreadService();
