/**
 * RagRetrievalNode — Phase D stub
 *
 * Performs semantic retrieval from the library vector store and injects
 * relevant chunks into state.contentContext for downstream generators.
 *
 * SCAFFOLD: This node is a Phase D stub. It exists in the graph from Phase B
 * so that:
 *   1. BlogEngineNode type union is stable (routingDecision.primaryNode compiles)
 *   2. nodeExecutionOrder traces are accurate if requiresRAG is ever set true
 *
 * Phase D implementation: wire @blogengine/rag-service (sqlite-vec) here.
 * See ADR: BlogEngine RAG uses sqlite-vec not MemoryVectorStore.
 */

import type { BlogEngineStateType } from '../state/schema.js';
import type { NodeFactory } from './types.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('rag-retrieval-node');

export const createRagRetrievalNode: NodeFactory = (_options) => {
  return async (_state: BlogEngineStateType): Promise<Partial<BlogEngineStateType>> => {
    logger.warn('RagRetrievalNode is a Phase D stub — returning without retrieval');

    // Phase D TODO: query @blogengine/rag-service with state.userRequest,
    // inject results into state.contentContext.libraryItemIds

    return {
      currentAgent: 'rag_retrieval',
      nodeExecutionOrder: ['rag_retrieval'],
      // Route to orchestrator so it can re-decide with context available
      nextAction: 'done',
    };
  };
};
