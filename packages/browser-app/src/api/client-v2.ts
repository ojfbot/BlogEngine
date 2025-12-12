import axios, { type AxiosInstance } from 'axios';
import type {
  Thread,
  ThreadMessage,
  ThreadWithMessages,
  ChatRequest,
  ChatResponse,
} from '@blogengine/agent-core';

/**
 * API Client V2 for thread-based conversations
 */
export class ApiClientV2 {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001/api/v2') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new conversation thread
   */
  async createThread(params: {
    userId?: string;
    title?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Thread> {
    const response = await this.client.post<Thread>('/threads', params);
    return response.data;
  }

  /**
   * List all threads for a user
   */
  async listThreads(params: { userId?: string }): Promise<Thread[]> {
    const response = await this.client.get<Thread[]>('/threads', {
      params,
    });
    return response.data;
  }

  /**
   * Get a specific thread with its messages
   */
  async getThread(threadId: string): Promise<ThreadWithMessages> {
    const response = await this.client.get<ThreadWithMessages>(
      `/threads/${threadId}`
    );
    return response.data;
  }

  /**
   * Update thread metadata (title, etc.)
   */
  async updateThread(
    threadId: string,
    updates: {
      title?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Thread> {
    const response = await this.client.put<Thread>(
      `/threads/${threadId}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete a thread
   */
  async deleteThread(threadId: string): Promise<void> {
    await this.client.delete(`/threads/${threadId}`);
  }

  /**
   * Send a message and stream the response
   * @param request Chat request with message and optional threadId
   * @param onToken Callback for each token received
   * @param onNodeStart Callback when agent node starts
   * @param onNodeEnd Callback when agent node ends
   * @param onError Callback for errors
   * @returns Promise that resolves with the complete response
   */
  async chatStream(
    request: ChatRequest,
    callbacks: {
      onToken?: (token: string) => void;
      onNodeStart?: (node: string) => void;
      onNodeEnd?: (node: string) => void;
      onError?: (error: string) => void;
    } = {}
  ): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(
        `${this.baseUrl}/chat/stream?` +
          new URLSearchParams({
            threadId: request.threadId || '',
            userId: request.userId || '',
            message: request.message,
            metadata: JSON.stringify(request.metadata || {}),
          })
      );

      let fullContent = '';
      let messageId = '';
      let threadId = '';
      let createdAt = '';

      eventSource.addEventListener('start', (e: Event) => {
        const data = JSON.parse((e as MessageEvent).data);
        messageId = data.messageId;
        threadId = data.threadId;
        createdAt = data.createdAt;
      });

      eventSource.addEventListener('token', (e: Event) => {
        const data = JSON.parse((e as MessageEvent).data);
        fullContent += data.token;
        callbacks.onToken?.(data.token);
      });

      eventSource.addEventListener('node_start', (e: Event) => {
        const data = JSON.parse((e as MessageEvent).data);
        callbacks.onNodeStart?.(data.node);
      });

      eventSource.addEventListener('node_end', (e: Event) => {
        const data = JSON.parse((e as MessageEvent).data);
        callbacks.onNodeEnd?.(data.node);
      });

      eventSource.addEventListener('error', (e: Event) => {
        const data = JSON.parse((e as MessageEvent).data);
        callbacks.onError?.(data.error);
        eventSource.close();
        reject(new Error(data.error));
      });

      eventSource.addEventListener('end', () => {
        eventSource.close();
        resolve({
          messageId,
          threadId,
          content: fullContent,
          createdAt,
        });
      });

      eventSource.onerror = () => {
        eventSource.close();
        reject(new Error('Stream connection error'));
      };
    });
  }

  /**
   * Send a message without streaming (simple request/response)
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/chat', request);
    return response.data;
  }

  /**
   * Get messages for a specific thread
   */
  async getMessages(threadId: string): Promise<ThreadMessage[]> {
    const response = await this.client.get<ThreadMessage[]>(
      `/threads/${threadId}/messages`
    );
    return response.data;
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Export a singleton instance
export const apiClientV2 = new ApiClientV2();
