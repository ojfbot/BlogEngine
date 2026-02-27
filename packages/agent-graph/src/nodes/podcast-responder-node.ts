/**
 * PodcastResponderAgentNode
 *
 * Generates a blog post that responds to a podcast or article in
 * "yes, and..." exploratory tone — collaborative, never confrontational.
 *
 * Tone constraint enforced downstream by ToneCheckerNode, not here.
 * This node generates the draft; tone is validated as a separate step.
 *
 * System prompt framing:
 *   - "yes, and..." or "interesting other direction" as structural openings
 *   - Build on the original ideas; add perspective without attacking
 *   - Cite specific quotes/moments from state.contentContext
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { BlogEngineStateType } from '../state/schema.js';
import type { NodeFactory } from './types.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('podcast-responder-node');

const SYSTEM_PROMPT = `You are a thoughtful blogger writing a response to a podcast or article.

Framing requirements:
- Open with "Yes, and..." or "This made me think..." or a direct reference to a specific moment from the source
- Build on the original ideas — add your perspective, never attack or dismiss
- Cite 2–3 specific quotes or moments from the source material
- Explore one compelling direction the original didn't go
- Collaborative, exploratory, intellectually generous tone throughout
- 800–1200 words in markdown format
- End with an invitation for the original creator to continue the conversation

Return ONLY the markdown content — no preamble or explanation.`;

export const createPodcastResponderNode: NodeFactory = (options) => {
  const model = new ChatAnthropic({
    apiKey: options.apiKey,
    model: options.model ?? 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0.7,
  });

  return async (state: BlogEngineStateType): Promise<Partial<BlogEngineStateType>> => {
    logger.debug('PodcastResponderAgentNode executing');

    const transcript = state.contentContext?.transcript ?? '';
    const userThoughts = state.contentContext?.userThoughts ?? state.userRequest ?? '';

    try {
      const prompt = `${SYSTEM_PROMPT}\n\n${userThoughts ? `Your angle: ${userThoughts}\n\n` : ''}Source material:\n${transcript || '(no transcript provided)'}`;
      const response = await model.invoke([new HumanMessage(prompt)]);
      const draft = typeof response.content === 'string'
        ? response.content
        : (response.content as Array<{type:string;text?:string}>).map(c => c.type==='text'?c.text??'':'').join('');

      logger.info({ draftLength: draft.length }, 'PodcastResponderAgentNode produced draft');

      return {
        currentAgent: 'podcast_responder',
        nodeExecutionOrder: ['podcast_responder'],
        generationResult: { draft, format: 'markdown' },
        nextAction: 'check_tone',
        messages: [new AIMessage(draft)],
      };
    } catch (error) {
      logger.error({ error }, 'PodcastResponderAgentNode failed');
      return {
        currentAgent: 'podcast_responder',
        nodeExecutionOrder: ['podcast_responder'],
        nextAction: 'error',
        messages: [new AIMessage(String(error))],
      };
    }
  };
};
