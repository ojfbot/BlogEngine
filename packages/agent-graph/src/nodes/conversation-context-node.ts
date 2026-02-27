/**
 * ConversationContextNode
 *
 * Builds structured context from the raw transcript — extracts key quotes,
 * identifies timestamps, and prepares the framing for the responder agent.
 *
 * Uses an LLM call to extract salient quotes and structure them for
 * PodcastResponderAgentNode. Appends the structured extraction to the transcript
 * so downstream nodes can reference it without a separate field.
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { BlogEngineStateType } from '../state/schema.js';
import type { NodeFactory } from './types.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('conversation-context-node');

const SYSTEM_PROMPT = `You are a conversation analyst. Extract the 5–8 most compelling quotes or moments from the provided transcript.

Return your response in this exact format:

**Key Quotes**
1. "[exact quote]" — [brief context / why this matters]
2. "[exact quote]" — [brief context / why this matters]
...

**Core Themes**
- [theme 1]
- [theme 2]
...

**Suggested Angles**
- [angle 1: how a blogger could respond to this]
- [angle 2]`;

export const createConversationContextNode: NodeFactory = (options) => {
  const model = new ChatAnthropic({
    apiKey: options.apiKey,
    model: options.model ?? 'claude-sonnet-4-20250514',
    maxTokens: 1024,
    temperature: 0.2,
  });

  return async (state: BlogEngineStateType): Promise<Partial<BlogEngineStateType>> => {
    logger.debug('ConversationContextNode executing');

    const transcript = state.contentContext?.transcript ?? '';
    const userThoughts = state.contentContext?.userThoughts ?? '';

    if (!transcript) {
      logger.warn('No transcript in contentContext — skipping extraction');
      return {
        currentAgent: 'conversation_context',
        nodeExecutionOrder: ['conversation_context'],
        nextAction: 'respond_to_podcast',
        messages: [new AIMessage('No transcript provided — proceeding without structured context.')],
      };
    }

    try {
      const prompt = `${SYSTEM_PROMPT}\n\n${userThoughts ? `User angle: ${userThoughts}\n\n` : ''}Transcript:\n${transcript}`;
      const response = await model.invoke([new HumanMessage(prompt)]);
      const content = typeof response.content === 'string'
        ? response.content
        : (response.content as Array<{type:string;text?:string}>).map(c => c.type==='text'?c.text??'':'').join('');

      logger.info('ConversationContextNode extracted structured context');

      return {
        currentAgent: 'conversation_context',
        nodeExecutionOrder: ['conversation_context'],
        contentContext: {
          ...state.contentContext,
          transcript: `${transcript}\n\n---STRUCTURED CONTEXT---\n${content}`,
        },
        nextAction: 'respond_to_podcast',
        messages: [new AIMessage(content)],
      };
    } catch (error) {
      logger.error({ error }, 'ConversationContextNode failed');
      return {
        currentAgent: 'conversation_context',
        nodeExecutionOrder: ['conversation_context'],
        nextAction: 'error',
        messages: [new AIMessage(String(error))],
      };
    }
  };
};
