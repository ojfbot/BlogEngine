/**
 * EditorNode
 *
 * Refines generationResult.draft for structure, clarity, and flow.
 * Triggered by ToneCheckerNode when tone violations are found, or
 * directly when nextAction = 'edit_content'.
 *
 * After editing, routes back to tone_checker (retryCount already incremented
 * by ToneCheckerNode before routing here).
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import type { BlogEngineStateType } from '../state/schema.js';
import type { NodeFactory } from './types.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('editor-node');

const SYSTEM_PROMPT = `You are an editor refining a blog post draft. Fix the listed tone violations while preserving the substance and voice of the original.

Tone requirements:
- Collaborative and exploratory, never confrontational or dismissive
- Intellectually generous — build on others' ideas, don't attack them
- "Yes, and..." framing: acknowledge before extending
- Confident but humble — share perspective without lecturing

Instructions:
1. Read the violations carefully
2. Revise ONLY the passages that violate tone
3. Return the full revised draft in markdown — do not summarise or truncate
4. Do not add a preamble or explanation`;

export const createEditorNode: NodeFactory = (options) => {
  const model = new ChatAnthropic({
    apiKey: options.apiKey,
    model: options.model ?? 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0.3,
  });

  return async (state: BlogEngineStateType): Promise<Partial<BlogEngineStateType>> => {
    const violations = state.toneValidation?.violations ?? [];
    logger.debug({ violations }, 'EditorNode executing');

    const draft = state.generationResult?.draft ?? '';
    if (!draft) {
      logger.warn('No draft to edit — skipping');
      return {
        currentAgent: 'editor',
        nodeExecutionOrder: ['editor'],
        nextAction: 'check_tone',
        messages: [new AIMessage('No draft to edit.')],
      };
    }

    try {
      const violationList = violations.length > 0
        ? `Tone violations to fix:\n${violations.map((v, i) => `${i + 1}. ${v}`).join('\n')}`
        : 'General review: ensure the tone is collaborative and exploratory throughout.';

      const prompt = `${SYSTEM_PROMPT}\n\n${violationList}\n\nDraft to revise:\n${draft}`;
      const response = await model.invoke([new HumanMessage(prompt)]);
      const revisedDraft = typeof response.content === 'string'
        ? response.content
        : (response.content as Array<{type:string;text?:string}>).map(c => c.type==='text'?c.text??'':'').join('');

      logger.info({ revisedLength: revisedDraft.length }, 'EditorNode produced revised draft');

      return {
        currentAgent: 'editor',
        nodeExecutionOrder: ['editor'],
        generationResult: {
          ...(state.generationResult ?? { format: 'markdown' }),
          draft: revisedDraft,
        },
        nextAction: 'check_tone',
        messages: [new AIMessage(revisedDraft)],
      };
    } catch (error) {
      logger.error({ error }, 'EditorNode failed');
      return {
        currentAgent: 'editor',
        nodeExecutionOrder: ['editor'],
        nextAction: 'error',
        messages: [new AIMessage(String(error))],
      };
    }
  };
};
