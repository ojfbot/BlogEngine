/**
 * ToneCheckerNode
 *
 * Validates that generationResult.draft maintains collaborative/exploratory tone.
 * Uses semantic analysis (LLM-based), not keyword matching.
 *
 * Routing outcome:
 *   pass  → nextAction = 'optimize_seo'  (continue to SEOOptimizerNode)
 *   fail, retryCount < 2 → nextAction = 'edit_content'  (send to EditorNode)
 *   fail, retryCount >= 2 → nextAction = 'optimize_seo' (hard cap passthrough)
 *
 * Hard cap rationale: prevents infinite loops from adversarial prompts that
 * consistently produce flagged content. See ADR: ToneCheckerNode retry cap.
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import type { BlogEngineStateType } from '../state/schema.js';
import type { NodeFactory } from './types.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('tone-checker-node');

export const TONE_RETRY_CAP = 2;

const SYSTEM_PROMPT = `You are a tone auditor for a collaborative blog. Assess whether the draft maintains a "yes, and..." collaborative, exploratory tone.

Return ONLY a JSON object:
{
  "passed": boolean,
  "violations": ["array of semantic descriptions of tone violations, empty if passed"]
}

Tone violations include (but are not limited to):
- Confrontational or dismissive language toward the source material or its creators
- Lecturing or condescending framing
- Absolute negative claims ("they are wrong", "this is terrible")
- Sarcasm or mockery

Collaborative tone markers (these should be present, not flagged):
- Builds on ideas rather than tearing them down
- Uses "yes, and...", "this made me think...", "building on this..."
- Acknowledges merit before extending or redirecting
- Invites dialogue rather than closing it

No markdown fences, no explanation — raw JSON only.`;

export const createToneCheckerNode: NodeFactory = (options) => {
  const model = new ChatAnthropic({
    apiKey: options.apiKey,
    model: options.model ?? 'claude-sonnet-4-20250514',
    maxTokens: 512,
    temperature: 0.1,
  });

  return async (state: BlogEngineStateType): Promise<Partial<BlogEngineStateType>> => {
    const currentRetryCount = state.toneValidation?.retryCount ?? 0;
    logger.debug({ retryCount: currentRetryCount }, 'ToneCheckerNode executing');

    // Hard cap: passthrough on 3rd attempt regardless of tone result.
    if (currentRetryCount >= TONE_RETRY_CAP) {
      logger.warn({ retryCount: currentRetryCount }, 'ToneCheckerNode: hard cap reached, passing through');
      return {
        currentAgent: 'tone_checker',
        nodeExecutionOrder: ['tone_checker'],
        toneValidation: {
          passed: true,  // forced passthrough — not a genuine pass
          violations: state.toneValidation?.violations ?? [],
          retryCount: currentRetryCount,
        },
        nextAction: 'optimize_seo',
      };
    }

    const draft = state.generationResult?.draft ?? '';
    if (!draft) {
      logger.warn('No draft to assess — passing through');
      return {
        currentAgent: 'tone_checker',
        nodeExecutionOrder: ['tone_checker'],
        toneValidation: { passed: true, violations: [], retryCount: currentRetryCount },
        nextAction: 'optimize_seo',
      };
    }

    try {
      const response = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(`Draft to assess:\n${draft}`),
      ]);
      const raw = typeof response.content === 'string'
        ? response.content
        : (response.content as Array<{type:string;text?:string}>).map(c => c.type==='text'?c.text??'':'').join('');

      let assessment: { passed: boolean; violations: string[] } = {
        passed: false,
        violations: ['tone check failed: could not parse LLM response'],
      };
      try {
        assessment = JSON.parse(raw);
      } catch {
        logger.warn({ raw }, 'ToneCheckerNode: failed to parse JSON — defaulting to fail');
      }

      if (assessment.passed) {
        logger.info('ToneCheckerNode: tone passed');
        return {
          currentAgent: 'tone_checker',
          nodeExecutionOrder: ['tone_checker'],
          toneValidation: { passed: true, violations: [], retryCount: currentRetryCount },
          nextAction: 'optimize_seo',
        };
      }

      const newRetryCount = currentRetryCount + 1;
      logger.info({ violations: assessment.violations, newRetryCount }, 'ToneCheckerNode: tone failed — routing to editor');
      return {
        currentAgent: 'tone_checker',
        nodeExecutionOrder: ['tone_checker'],
        toneValidation: {
          passed: false,
          violations: assessment.violations,
          retryCount: newRetryCount,
        },
        nextAction: 'edit_content',
      };
    } catch (error) {
      logger.error({ error }, 'ToneCheckerNode failed — defaulting to pass');
      return {
        currentAgent: 'tone_checker',
        nodeExecutionOrder: ['tone_checker'],
        toneValidation: { passed: true, violations: [], retryCount: currentRetryCount },
        nextAction: 'optimize_seo',
      };
    }
  };
};

