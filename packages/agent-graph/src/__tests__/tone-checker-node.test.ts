/**
 * ToneCheckerNode tests
 *
 * Phase B spec acceptance criteria for tone enforcement.
 * LLM calls are mocked via vi.mock('@langchain/anthropic') so tests
 * run deterministically without real API keys.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

// Must be declared before the module-level vi.mock hoisting
const mockInvoke = vi.fn();

vi.mock('@langchain/anthropic', () => ({
  ChatAnthropic: vi.fn(() => ({ invoke: mockInvoke })),
}));

import { createToneCheckerNode, TONE_RETRY_CAP } from '../nodes/tone-checker-node.js';
import { createInitialState } from '../state/schema.js';

const stubOptions = { apiKey: 'test-key' };

describe('ToneCheckerNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hard cap (no LLM required — pure state logic)', () => {
    it('passes through when retryCount >= TONE_RETRY_CAP regardless of content', async () => {
      const node = createToneCheckerNode(stubOptions);
      const state = {
        ...createInitialState('user-1', 'thread-1'),
        generationResult: {
          draft: 'This is completely wrong and you missed the point entirely.',
          format: 'markdown' as const,
        },
        toneValidation: {
          passed: false,
          violations: ['confrontational framing'],
          retryCount: TONE_RETRY_CAP,  // at the cap
        },
      };

      const result = await node(state as any);

      expect(result.nextAction).toBe('optimize_seo');
      expect(result.toneValidation?.passed).toBe(true);
      expect(result.toneValidation?.retryCount).toBe(TONE_RETRY_CAP);
    });

    it('TONE_RETRY_CAP is 2', () => {
      expect(TONE_RETRY_CAP).toBe(2);
    });
  });

  describe('tone assessment (LLM-backed)', () => {
    it('passes content with "yes, and this is interesting because" — retryCount stays 0', async () => {
      mockInvoke.mockResolvedValue({
        content: JSON.stringify({ passed: true, violations: [] }),
      });

      const node = createToneCheckerNode(stubOptions);
      const state = {
        ...createInitialState('user-1', 'thread-1'),
        generationResult: {
          draft: 'Yes, and this is interesting because it opens new directions.',
          format: 'markdown' as const,
        },
        toneValidation: { passed: false, violations: [], retryCount: 0 },
      };

      const result = await node(state as any);

      expect(result.nextAction).toBe('optimize_seo');
      expect(result.toneValidation?.passed).toBe(true);
      expect(result.toneValidation?.retryCount).toBe(0);
      expect(mockInvoke).toHaveBeenCalledOnce();
    });

    it('fails content with confrontational framing — routes to editor, retryCount increments to 1', async () => {
      mockInvoke.mockResolvedValue({
        content: JSON.stringify({
          passed: false,
          violations: ['Confrontational framing: "completely wrong and you missed the point"'],
        }),
      });

      const node = createToneCheckerNode(stubOptions);
      const state = {
        ...createInitialState('user-1', 'thread-1'),
        generationResult: {
          draft: 'This is completely wrong and you missed the point entirely.',
          format: 'markdown' as const,
        },
        toneValidation: { passed: false, violations: [], retryCount: 0 },
      };

      const result = await node(state as any);

      expect(result.nextAction).toBe('edit_content');
      expect(result.toneValidation?.passed).toBe(false);
      expect(result.toneValidation?.retryCount).toBe(1);
      expect(result.toneValidation?.violations).toHaveLength(1);
    });

    it('increments retryCount on second fail, routes to editor again', async () => {
      mockInvoke.mockResolvedValue({
        content: JSON.stringify({
          passed: false,
          violations: ['Still dismissive after first edit'],
        }),
      });

      const node = createToneCheckerNode(stubOptions);
      const state = {
        ...createInitialState('user-1', 'thread-1'),
        generationResult: {
          draft: 'You are still wrong about this.',
          format: 'markdown' as const,
        },
        toneValidation: { passed: false, violations: ['previous violation'], retryCount: 1 },
      };

      const result = await node(state as any);

      expect(result.nextAction).toBe('edit_content');
      expect(result.toneValidation?.retryCount).toBe(2);
    });

    it('on third attempt (retryCount = 2) LLM is NOT called — hard cap passes through', async () => {
      const node = createToneCheckerNode(stubOptions);
      const state = {
        ...createInitialState('user-1', 'thread-1'),
        generationResult: {
          draft: 'Confrontational content that would normally fail.',
          format: 'markdown' as const,
        },
        toneValidation: {
          passed: false,
          violations: ['confrontational framing'],
          retryCount: TONE_RETRY_CAP,
        },
      };

      const result = await node(state as any);

      expect(result.nextAction).toBe('optimize_seo');
      expect(result.toneValidation?.passed).toBe(true);
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('violations array contains semantic descriptions, not keyword matches', async () => {
      mockInvoke.mockResolvedValue({
        content: JSON.stringify({
          passed: false,
          violations: [
            'Dismissive framing in paragraph 2: presents opposing view as naive without engaging with its merits',
            'Absolute negative claim: "this approach always fails" forecloses dialogue',
          ],
        }),
      });

      const node = createToneCheckerNode(stubOptions);
      const state = {
        ...createInitialState('user-1', 'thread-1'),
        generationResult: {
          draft: 'This naive approach always fails.',
          format: 'markdown' as const,
        },
        toneValidation: { passed: false, violations: [], retryCount: 0 },
      };

      const result = await node(state as any);

      // Violations are full sentences (semantic descriptions), not short keywords
      expect(result.toneValidation?.violations?.every(v => v.length > 20)).toBe(true);
      expect(result.toneValidation?.violations?.[0]).toContain('Dismissive');
    });
  });
});
