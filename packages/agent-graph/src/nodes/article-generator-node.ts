/**
 * ArticleGeneratorNode
 *
 * Drafts general blog articles from a topic prompt or outline.
 * Output: state.generationResult.draft (markdown format by default).
 *
 * Phase D: state.contentContext.libraryItemIds will inject RAG-retrieved context.
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { BlogEngineStateType } from '../state/schema.js';
import type { NodeFactory } from './types.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('article-generator-node');

const SYSTEM_PROMPT = `You are an expert technical blogger. Write a well-structured, engaging blog post in markdown format.

Guidelines:
- Clear H1 title, logical H2/H3 sections
- Conversational but authoritative tone
- Concrete examples and actionable insights
- 800–1500 words
- End with a clear takeaway or call to action

Return ONLY the markdown content — no preamble or explanation.`;

export const createArticleGeneratorNode: NodeFactory = (options) => {
  const model = new ChatAnthropic({
    apiKey: options.apiKey,
    model: options.model ?? 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0.7,
  });

  return async (state: BlogEngineStateType): Promise<Partial<BlogEngineStateType>> => {
    logger.debug({ userRequest: state.userRequest }, 'ArticleGeneratorNode executing');

    const userRequest = state.userRequest ?? '';
    const context = state.contentContext?.transcript ?? '';

    try {
      const prompt = context
        ? `${SYSTEM_PROMPT}\n\nUser request: ${userRequest}\n\nAdditional context:\n${context}`
        : `${SYSTEM_PROMPT}\n\nUser request: ${userRequest}`;

      const response = await model.invoke([new HumanMessage(prompt)]);
      const draft = typeof response.content === 'string'
        ? response.content
        : (response.content as Array<{type:string;text?:string}>).map(c => c.type==='text'?c.text??'':'').join('');

      logger.info({ draftLength: draft.length }, 'ArticleGeneratorNode produced draft');

      return {
        currentAgent: 'article_generator',
        nodeExecutionOrder: ['article_generator'],
        generationResult: { draft, format: 'markdown' },
        nextAction: 'check_tone',
        messages: [new AIMessage(draft)],
      };
    } catch (error) {
      logger.error({ error }, 'ArticleGeneratorNode failed');
      return {
        currentAgent: 'article_generator',
        nodeExecutionOrder: ['article_generator'],
        nextAction: 'error',
        messages: [new AIMessage(String(error))],
      };
    }
  };
};
