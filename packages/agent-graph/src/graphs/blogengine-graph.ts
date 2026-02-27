/**
 * BlogEngine LangGraph State Graph
 *
 * Wires all 9 nodes into a StateGraph<BlogEngineState>.
 * Routing is driven by state.nextAction set by each node.
 *
 * Flow (Podcast Responder path):
 *   START → orchestrator → media_ingestion → conversation_context
 *         → podcast_responder → tone_checker ─[pass]→ seo_optimizer → END
 *                                            ─[fail]→ editor → tone_checker
 *
 * Flow (Article path):
 *   START → orchestrator → article_generator → tone_checker → seo_optimizer → END
 *
 * SCAFFOLD: All node implementations are stubs. Wire is complete and
 * type-checks clean. Replace TODO stubs in each node file to activate.
 */

import { StateGraph, END, START } from '@langchain/langgraph';
import { BlogEngineState, type BlogEngineStateType } from '../state/schema.js';
import { createSQLiteCheckpointer } from '../state/checkpointer.js';
import type { NextAction } from '../state/types.js';
import type { NodeOptions } from '../nodes/types.js';
import {
  createOrchestratorNode,
  createMediaIngestionNode,
  createConversationContextNode,
  createArticleGeneratorNode,
  createPodcastResponderNode,
  createToneCheckerNode,
  createEditorNode,
  createSEOOptimizerNode,
  createRagRetrievalNode,
} from '../nodes/index.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('blogengine-graph');

export interface GraphConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  dbPath?: string;
}

/**
 * Conditional routing function.
 * Reads state.nextAction and returns the next node name (or END).
 */
function routeByNextAction(state: BlogEngineStateType): string {
  const action: NextAction = state.nextAction;
  logger.debug({ action, currentAgent: state.currentAgent }, 'Routing');

  switch (action) {
    case 'generate_article':
      return 'articleGeneratorNode';
    case 'respond_to_podcast':
      // OrchestratorNode sets this; MediaIngestionNode and ConversationContextNode
      // also emit it to continue the chain.
      if (state.currentAgent === 'orchestrator') return 'mediaIngestionNode';
      if (state.currentAgent === 'media_ingestion') return 'conversationContextNode';
      return 'podcastResponderNode';
    case 'check_tone':
      return 'toneCheckerNode';
    case 'edit_content':
      return 'editorNode';
    case 'optimize_seo':
      return 'seoOptimizerNode';
    case 'retrieve_context':
      return 'ragRetrievalNode';
    case 'done':
      return END;
    case 'error':
      return END;
    default:
      // Safety net — unknown action returns to orchestrator rather than hanging.
      logger.warn({ action }, 'Unknown nextAction — routing to orchestrator');
      return 'orchestratorNode';
  }
}

/**
 * Create and compile the BlogEngine graph.
 */
export function createBlogEngineGraph(config: GraphConfig) {
  logger.info('Creating BlogEngine graph');

  const nodeOptions: NodeOptions = {
    apiKey: config.apiKey,
    model: config.model ?? 'claude-sonnet-4-20250514',
    temperature: config.temperature ?? 0.7,
    maxTokens: config.maxTokens ?? 4096,
  };

  const checkpointer = createSQLiteCheckpointer(config.dbPath ?? './blogengine.db');

  const graph = new StateGraph(BlogEngineState)
    // ---- Nodes ----
    .addNode('orchestratorNode',        createOrchestratorNode(nodeOptions))
    .addNode('mediaIngestionNode',      createMediaIngestionNode(nodeOptions))
    .addNode('conversationContextNode', createConversationContextNode(nodeOptions))
    .addNode('articleGeneratorNode',    createArticleGeneratorNode(nodeOptions))
    .addNode('podcastResponderNode',    createPodcastResponderNode(nodeOptions))
    .addNode('toneCheckerNode',         createToneCheckerNode(nodeOptions))
    .addNode('editorNode',              createEditorNode(nodeOptions))
    .addNode('seoOptimizerNode',        createSEOOptimizerNode(nodeOptions))
    .addNode('ragRetrievalNode',        createRagRetrievalNode(nodeOptions))  // Phase D stub

    // ---- Edges ----
    .addEdge(START, 'orchestratorNode')
    .addConditionalEdges('orchestratorNode',        routeByNextAction)
    .addConditionalEdges('mediaIngestionNode',      routeByNextAction)
    .addConditionalEdges('conversationContextNode', routeByNextAction)
    .addConditionalEdges('articleGeneratorNode',    routeByNextAction)
    .addConditionalEdges('podcastResponderNode',    routeByNextAction)
    .addConditionalEdges('toneCheckerNode',         routeByNextAction)
    .addConditionalEdges('editorNode',              routeByNextAction)
    .addConditionalEdges('seoOptimizerNode',        routeByNextAction)
    .addConditionalEdges('ragRetrievalNode',        routeByNextAction);

  return graph.compile({ checkpointer });
}

export type CompiledBlogEngineGraph = ReturnType<typeof createBlogEngineGraph>;
