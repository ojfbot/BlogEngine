import { randomUUID } from 'crypto';
import type {
  Thread,
  ThreadWithMessages,
  ThreadMessage,
} from '@blogengine/agent-core';

/**
 * In-memory storage for threads and messages
 * In production, this would be replaced with a database
 */
class ThreadService {
  private threads: Map<string, ThreadWithMessages> = new Map();

  /**
   * Create a new thread
   */
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

    this.threads.set(threadId, {
      ...thread,
      messages: [],
    });

    return thread;
  }

  /**
   * List all threads for a user
   */
  async listThreads(userId?: string): Promise<Thread[]> {
    const allThreads = Array.from(this.threads.values());

    // Filter by userId if provided
    const filtered = userId
      ? allThreads.filter(t => t.userId === userId)
      : allThreads;

    // Sort by updatedAt descending
    return filtered
      .map(({ messages, ...thread }) => thread)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Get a specific thread with messages
   */
  async getThread(threadId: string): Promise<ThreadWithMessages | null> {
    return this.threads.get(threadId) || null;
  }

  /**
   * Update a thread
   */
  async updateThread(
    threadId: string,
    updates: {
      title?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Thread | null> {
    const thread = this.threads.get(threadId);
    if (!thread) {
      return null;
    }

    const updatedThread: ThreadWithMessages = {
      ...thread,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.threads.set(threadId, updatedThread);

    const { messages, ...threadData } = updatedThread;
    return threadData;
  }

  /**
   * Delete a thread
   */
  async deleteThread(threadId: string): Promise<void> {
    this.threads.delete(threadId);
  }

  /**
   * Get messages for a thread
   */
  async getMessages(threadId: string): Promise<ThreadMessage[]> {
    const thread = this.threads.get(threadId);
    return thread?.messages || [];
  }

  /**
   * Add a message to a thread
   */
  async addMessage(
    threadId: string,
    message: Omit<ThreadMessage, 'messageId' | 'threadId' | 'createdAt'>
  ): Promise<ThreadMessage> {
    const thread = this.threads.get(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    const newMessage: ThreadMessage = {
      messageId: randomUUID(),
      threadId,
      role: message.role,
      content: message.content,
      metadata: message.metadata,
      createdAt: new Date().toISOString(),
    };

    thread.messages.push(newMessage);
    thread.updatedAt = newMessage.createdAt;
    this.threads.set(threadId, thread);

    return newMessage;
  }
}

// Export singleton instance
export const threadService = new ThreadService();
