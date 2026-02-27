/**
 * @blogengine/agent-graph
 *
 * LangGraph multi-agent orchestration for BlogEngine.
 * Phase B: state schema, 9 node skeletons, graph wiring, SQLite checkpointer.
 * Nodes are stubs — replace TODO comments in each node file to activate.
 */

export { createBlogEngineGraph } from './graphs/blogengine-graph.js';
export type { GraphConfig, CompiledBlogEngineGraph } from './graphs/blogengine-graph.js';

export { BlogEngineState, createInitialState } from './state/schema.js';
export type { BlogEngineStateType } from './state/schema.js';

export type {
  BlogEngineNode,
  NextAction,
  NodeOptions,
  GenerationResult,
  ToneValidation,
  ContentContext,
  RoutingDecision,
} from './state/types.js';

export { SQLiteCheckpointer, createSQLiteCheckpointer } from './state/checkpointer.js';

export {
  createOrchestratorNode,
  createMediaIngestionNode,
  createConversationContextNode,
  createArticleGeneratorNode,
  createPodcastResponderNode,
  createToneCheckerNode,
  TONE_RETRY_CAP,
  createEditorNode,
  createSEOOptimizerNode,
  createRagRetrievalNode,
} from './nodes/index.js';
