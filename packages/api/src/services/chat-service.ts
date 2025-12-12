import { randomUUID } from 'crypto';
import type { ChatRequest, ChatResponse } from '@blogengine/agent-core';
import { threadService } from './thread-service.js';
import { logger } from '@blogengine/agent-core';

interface StreamCallbacks {
  onStart?: (data: { messageId: string; threadId: string; createdAt: string }) => void;
  onToken?: (token: string) => void;
  onNodeStart?: (node: string) => void;
  onNodeEnd?: (node: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

/**
 * Chat service for handling AI conversations
 */
class ChatService {
  /**
   * Stream chat response
   */
  async streamChat(
    request: ChatRequest,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      // Get or create thread
      let threadId = request.threadId;
      if (!threadId) {
        const thread = await threadService.createThread({
          userId: request.userId,
          title: request.message.slice(0, 50) + (request.message.length > 50 ? '...' : ''),
        });
        threadId = thread.threadId;
      }

      // Add user message to thread
      await threadService.addMessage(threadId, {
        role: 'user',
        content: request.message,
        metadata: request.metadata,
      });

      // Generate response
      const messageId = randomUUID();
      const createdAt = new Date().toISOString();

      callbacks.onStart?.({
        messageId,
        threadId,
        createdAt,
      });

      // Simulate AI response with streaming
      // TODO: Replace with actual agent-graph integration
      const response = this.generateMockResponse(request.message);
      const tokens = response.split(' ');

      for (const token of tokens) {
        callbacks.onToken?.(token + ' ');
        await this.delay(50); // Simulate streaming delay
      }

      // Add assistant message to thread
      await threadService.addMessage(threadId, {
        role: 'assistant',
        content: response,
      });

      callbacks.onEnd?.();
    } catch (error) {
      logger.error({ error }, 'Chat stream error');
      callbacks.onError?.(String(error));
    }
  }

  /**
   * Send chat message (non-streaming)
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Get or create thread
    let threadId = request.threadId;
    if (!threadId) {
      const thread = await threadService.createThread({
        userId: request.userId,
        title: request.message.slice(0, 50) + (request.message.length > 50 ? '...' : ''),
      });
      threadId = thread.threadId;
    }

    // Add user message
    await threadService.addMessage(threadId, {
      role: 'user',
      content: request.message,
      metadata: request.metadata,
    });

    // Generate response
    // TODO: Replace with actual agent-graph integration
    const content = this.generateMockResponse(request.message);

    // Add assistant message
    const message = await threadService.addMessage(threadId, {
      role: 'assistant',
      content,
    });

    return {
      messageId: message.messageId,
      threadId: message.threadId,
      content: message.content,
      createdAt: message.createdAt,
      metadata: message.metadata,
    };
  }

  /**
   * Generate a mock AI response
   * TODO: Replace with actual agent-graph integration
   */
  private generateMockResponse(userMessage: string): string {
    const responses = [
      "I'm a placeholder AI assistant. The actual agent-graph integration is coming soon!",
      "Thanks for your message! I'll be much smarter once the agent-graph is connected.",
      "I understand you're asking about: '" + userMessage.slice(0, 50) + "'. Full AI capabilities coming soon!",
      "Great question! Once the BlogEngine agent system is integrated, I'll be able to help you with content generation, research, and more.",
    ];

    const index = Math.floor(Math.random() * responses.length);
    return (responses[index] || responses[0]) as string;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const chatService = new ChatService();
