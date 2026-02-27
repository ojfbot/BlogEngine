/**
 * BlogEngine LangGraph State Schema
 *
 * Uses LangGraph's Annotation.Root pattern (same as cv-builder).
 * All nodes read from and write to this shared blackboard.
 * State is persisted via SQLite checkpointer for cross-restart durability.
 */

import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import type {
  BlogEngineNode,
  NextAction,
  ContentContext,
  GenerationResult,
  ToneValidation,
  RoutingDecision,
} from './types.js';

// ---------------------------------------------------------------------------
// Message reducer — accumulates messages without replacement
// ---------------------------------------------------------------------------

function messagesReducer(
  existing: BaseMessage[] | undefined,
  update: BaseMessage[] | BaseMessage
): BaseMessage[] {
  const base = existing ?? [];
  return base.concat(Array.isArray(update) ? update : [update]);
}

// ---------------------------------------------------------------------------
// nodeExecutionOrder reducer — appends each node as it fires
// ---------------------------------------------------------------------------

function nodeOrderReducer(
  existing: BlogEngineNode[] | undefined,
  update: BlogEngineNode[] | BlogEngineNode
): BlogEngineNode[] {
  const base = existing ?? [];
  return base.concat(Array.isArray(update) ? update : [update]);
}

// ---------------------------------------------------------------------------
// State definition
// ---------------------------------------------------------------------------

/**
 * BlogEngineState — the "blackboard" shared across all nodes.
 *
 * SCAFFOLD: Fields without a custom reducer use last-write-wins semantics.
 * Only messages and nodeExecutionOrder need accumulator reducers.
 */
export const BlogEngineState = Annotation.Root({
  // ---------- Conversation ----------
  messages: Annotation<BaseMessage[]>({ reducer: messagesReducer }),

  // The raw user request text, set by OrchestratorNode on each turn.
  userRequest: Annotation<string>(),

  // ---------- Content input ----------
  contentContext: Annotation<ContentContext | undefined>(),

  // ---------- Generation output ----------
  generationResult: Annotation<GenerationResult | undefined>(),

  // ---------- Tone enforcement ----------
  // SCAFFOLD: toneValidation.retryCount hard cap is 2. OrchestratorNode must
  // check retryCount before routing to tone_checker — see ADR for rationale.
  toneValidation: Annotation<ToneValidation | undefined>(),

  // ---------- Routing ----------
  routingDecision: Annotation<RoutingDecision | undefined>(),

  // Control flow — read by the graph's conditional edge function.
  nextAction: Annotation<NextAction>(),

  // Name of the currently executing node (for logging / debugging).
  currentAgent: Annotation<BlogEngineNode>(),

  // ---------- Session ----------
  threadId: Annotation<string>(),
  userId: Annotation<string>(),

  // ---------- Metadata ----------
  isComplete: Annotation<boolean>(),

  // Accumulates node names in execution order for debugging and test assertions.
  nodeExecutionOrder: Annotation<BlogEngineNode[]>({ reducer: nodeOrderReducer }),

  model: Annotation<string>(),
  startedAt: Annotation<string>(),
});

export type BlogEngineStateType = typeof BlogEngineState.State;

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

export function createInitialState(
  userId: string,
  threadId: string,
  model = 'claude-sonnet-4-20250514'
): Partial<BlogEngineStateType> {
  return {
    messages: [],
    userRequest: '',
    contentContext: undefined,
    generationResult: undefined,
    toneValidation: undefined,
    routingDecision: undefined,
    nextAction: 'done',
    currentAgent: 'orchestrator',
    threadId,
    userId,
    isComplete: false,
    nodeExecutionOrder: [],
    model,
    startedAt: new Date().toISOString(),
  };
}
