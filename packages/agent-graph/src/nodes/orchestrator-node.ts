/**
 * OrchestratorNode — classifies intent, enforces tone retry hard cap.
 */
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { BlogEngineStateType } from '../state/schema.js';
import type { NextAction } from '../state/types.js';
import type { NodeFactory } from './types.js';
import { TONE_RETRY_CAP } from './tone-checker-node.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('orchestrator-node');

const SYSTEM_PROMPT = `You are the Orchestrator Agent for BlogEngine.
Classify the user request. Respond:

[Brief explanation]

**Next Action**: [action]

Actions:
- respond_to_podcast: responding to a podcast/article/video
- generate_article: writing a blog post from scratch
- done: informational or unclear`;

export const createOrchestratorNode: NodeFactory = (options) => {
  const model = new ChatAnthropic({
    apiKey: options.apiKey,
    model: options.model ?? 'claude-sonnet-4-20250514',
    maxTokens: 512,
    temperature: 0.1,
  });

  return async (state: BlogEngineStateType): Promise<Partial<BlogEngineStateType>> => {
    logger.debug({ userRequest: state.userRequest }, 'OrchestratorNode executing');

    if ((state.toneValidation?.retryCount ?? 0) >= TONE_RETRY_CAP) {
      logger.warn('Tone retry cap reached');
      return { currentAgent: 'orchestrator', nodeExecutionOrder: ['orchestrator'], nextAction: 'done' };
    }

    const userMessage = state.userRequest
      || (typeof state.messages.at(-1)?.content === 'string' ? state.messages.at(-1)!.content as string : '')
      || '';

    try {
      const response = await model.invoke([new HumanMessage(`${SYSTEM_PROMPT}

User request: ${userMessage}`)]);
      const content = typeof response.content === 'string'
        ? response.content
        : (response.content as Array<{type:string;text?:string}>).map(c => c.type==='text'?c.text??'':'').join('');

      let nextAction: NextAction = 'done';
      const match = content.match(/\*\*Next Action\*\*:\s*(\S+)/i);
      if (match?.[1]) {
        const raw = match[1].toLowerCase().replace(/[^a-z_]/g, '');
        if (raw === 'respond_to_podcast') nextAction = 'respond_to_podcast';
        else if (raw === 'generate_article') nextAction = 'generate_article';
      }

      logger.info({ nextAction }, 'Routed');
      return { currentAgent: 'orchestrator', nodeExecutionOrder: ['orchestrator'], userRequest: userMessage, nextAction, messages: [new AIMessage(content)] };
    } catch (error) {
      logger.error({ error }, 'OrchestratorNode failed');
      return { currentAgent: 'orchestrator', nodeExecutionOrder: ['orchestrator'], nextAction: 'error', messages: [new AIMessage(String(error))] };
    }
  };
};
