import { randomUUID } from 'crypto';
import type { ChatRequest, ChatResponse } from '@blogengine/agent-core';
import { logger, getConfig } from '@blogengine/agent-core';
import { createBlogEngineGraph, createInitialState } from '@blogengine/agent-graph';
import type { CompiledBlogEngineGraph } from '@blogengine/agent-graph';
import { threadService } from './thread-service.js';

interface StreamCallbacks {
  onStart?: (data: { messageId: string; threadId: string; createdAt: string }) => void;
  onToken?: (token: string) => void;
  onNodeStart?: (node: string) => void;
  onNodeEnd?: (node: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

/**
 * Chat service — delegates to the BlogEngine agent graph.
 */
class ChatService {
  private graph: CompiledBlogEngineGraph | null = null;

  private getGraph(): CompiledBlogEngineGraph {
    // Lazy singleton is safe: createBlogEngineGraph is synchronous and ChatService
    // is a module-level singleton, so concurrent calls will share the same instance.
    if (!this.graph) {
      const config = getConfig();
      this.graph = createBlogEngineGraph({
        apiKey: config.anthropicApiKey,
        model: config.model,
      });
    }
    return this.graph;
  }

  /**
   * Stream chat response via agent graph.
   * Phase B: node-level events are streamed; draft tokens are emitted on completion.
   * Phase C: switch to streamEvents for per-token LLM streaming.
   */
  async streamChat(
    request: ChatRequest,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      let threadId = request.threadId;
      if (!threadId) {
        const thread = await threadService.createThread({
          userId: request.userId,
          title: request.message.slice(0, 50) + (request.message.length > 50 ? '...' : ''),
        });
        threadId = thread.threadId;
      }

      await threadService.addMessage(threadId, {
        role: 'user',
        content: request.message,
        metadata: request.metadata,
      });

      const messageId = randomUUID();
      const createdAt = new Date().toISOString();
      callbacks.onStart?.({ messageId, threadId, createdAt });

      const initialState = createInitialState(request.userId ?? 'anonymous', threadId);
      const graphState = { ...initialState, userRequest: request.message };

      // Stream node-level updates so the UI can show progress.
      let finalDraft = '';
      const stream = await this.getGraph().stream(graphState, {
        configurable: { thread_id: threadId },
        streamMode: 'updates',
      });

      for await (const update of stream) {
        const nodeName = Object.keys(update)[0];
        if (!nodeName) continue;

        callbacks.onNodeStart?.(nodeName);
        const nodeState = update[nodeName];
        if (nodeState?.generationResult?.draft) {
          finalDraft = nodeState.generationResult.draft;
        }
        callbacks.onNodeEnd?.(nodeName);
      }

      // Emit the final draft as a token stream so the browser renders progressively.
      const responseText = finalDraft || '(No content generated)';
      const words = responseText.split(' ');
      for (const word of words) {
        callbacks.onToken?.(word + ' ');
      }

      await threadService.addMessage(threadId, {
        role: 'assistant',
        content: responseText,
      });

      callbacks.onEnd?.();
    } catch (error) {
      logger.error({ error }, 'Chat stream error');
      callbacks.onError?.(String(error));
    }
  }

  /**
   * Send chat message (non-streaming).
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    let threadId = request.threadId;
    if (!threadId) {
      const thread = await threadService.createThread({
        userId: request.userId,
        title: request.message.slice(0, 50) + (request.message.length > 50 ? '...' : ''),
      });
      threadId = thread.threadId;
    }

    await threadService.addMessage(threadId, {
      role: 'user',
      content: request.message,
      metadata: request.metadata,
    });

    const initialState = createInitialState(request.userId ?? 'anonymous', threadId);
    const graphState = { ...initialState, userRequest: request.message };

    const result = await this.getGraph().invoke(graphState, {
      configurable: { thread_id: threadId },
    });

    const content: string = result.generationResult?.draft
      || extractContent(result.messages?.at(-1)?.content)
      || '(No content generated)';

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
}

/** Safely extract plain text from a BaseMessage.content (string | MessageContent[]). */
function extractContent(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    return (raw as Array<{ type?: string; text?: string }>)
      .filter(c => c.type === 'text')
      .map(c => c.text ?? '')
      .join('');
  }
  return '';
}

// Export singleton instance
export const chatService = new ChatService();
