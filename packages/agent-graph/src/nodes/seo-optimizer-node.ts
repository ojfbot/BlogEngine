/**
 * SEOOptimizerNode
 *
 * Enriches generationResult.seoMetadata — meta title (≤60 chars),
 * meta description (≤160 chars), and keywords[]. Fires after tone is validated.
 *
 * Parses structured JSON from the LLM response for reliable field extraction.
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { BlogEngineStateType } from '../state/schema.js';
import type { NodeFactory } from './types.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('seo-optimizer-node');

const SYSTEM_PROMPT = `You are an SEO expert. Analyse the blog post and return ONLY a JSON object with these fields:
{
  "metaTitle": "string, ≤60 chars, compelling and keyword-rich",
  "metaDescription": "string, ≤160 chars, summarises the post for search results",
  "keywords": ["array", "of", "5-8", "relevant", "keywords"]
}

No markdown fences, no explanation — raw JSON only.`;

export const createSEOOptimizerNode: NodeFactory = (options) => {
  const model = new ChatAnthropic({
    apiKey: options.apiKey,
    model: options.model ?? 'claude-sonnet-4-20250514',
    maxTokens: 512,
    temperature: 0.2,
  });

  return async (state: BlogEngineStateType): Promise<Partial<BlogEngineStateType>> => {
    logger.debug('SEOOptimizerNode executing');

    const draft = state.generationResult?.draft ?? '';

    if (!draft) {
      logger.warn('No draft for SEO optimisation — returning empty metadata');
      return {
        currentAgent: 'seo_optimizer',
        nodeExecutionOrder: ['seo_optimizer'],
        nextAction: 'done',
        isComplete: true,
        messages: [new AIMessage('No draft to optimise.')],
      };
    }

    try {
      const response = await model.invoke([
        new HumanMessage(`${SYSTEM_PROMPT}\n\nBlog post:\n${draft}`),
      ]);
      const raw = typeof response.content === 'string'
        ? response.content
        : (response.content as Array<{type:string;text?:string}>).map(c => c.type==='text'?c.text??'':'').join('');

      let seoMetadata: { metaTitle?: string; metaDescription?: string; keywords: string[] } = { keywords: [] };
      try {
        seoMetadata = JSON.parse(raw);
      } catch {
        logger.warn({ raw }, 'SEOOptimizerNode: failed to parse JSON — using empty metadata');
      }

      logger.info({ metaTitle: seoMetadata.metaTitle }, 'SEOOptimizerNode produced metadata');

      return {
        currentAgent: 'seo_optimizer',
        nodeExecutionOrder: ['seo_optimizer'],
        generationResult: state.generationResult
          ? { ...state.generationResult, seoMetadata }
          : undefined,
        nextAction: 'done',
        isComplete: true,
        messages: [new AIMessage(raw)],
      };
    } catch (error) {
      logger.error({ error }, 'SEOOptimizerNode failed');
      return {
        currentAgent: 'seo_optimizer',
        nodeExecutionOrder: ['seo_optimizer'],
        nextAction: 'error',
        messages: [new AIMessage(String(error))],
      };
    }
  };
};
