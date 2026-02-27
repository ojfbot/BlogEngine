/**
 * BlogEngine Agent Graph — Core Types
 *
 * Defines the routing vocabulary and result shapes used across all nodes.
 * Keep this file free of LangGraph imports — it is the pure domain type layer.
 */

import type { ArticleFormat, SEOMetadata } from '@blogengine/agent-core';

// Re-export for convenience of graph consumers
export type { ArticleFormat, SEOMetadata };

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

/**
 * All nodes that can appear in a BlogEngineState execution trace.
 *
 * SCAFFOLD: 'rag_retrieval' is a Phase D stub — its node returns early.
 * It is included in the type union from the start so nodeExecutionOrder
 * is typesafe across all phases and routingDecision.primaryNode compiles.
 */
export type BlogEngineNode =
  | 'orchestrator'
  | 'media_ingestion'       // extracts metadata + transcript from URL/file
  | 'conversation_context'  // builds quote/timestamp context from transcript
  | 'article_generator'     // drafts general blog articles
  | 'podcast_responder'     // drafts "yes, and..." collaborative response posts
  | 'tone_checker'          // validates collaborative tone; re-routes to editor if needed
  | 'editor'                // refines structure, clarity, and flow
  | 'seo_optimizer'         // adds meta title, description, keywords
  | 'rag_retrieval';        // Phase D stub — semantic retrieval from library

/**
 * Actions the OrchestratorNode sets on state.nextAction to drive routing.
 * The graph's conditional edge reads this to select the next node.
 */
export type NextAction =
  | 'generate_article'
  | 'respond_to_podcast'    // triggers media_ingestion → conversation_context → podcast_responder
  | 'check_tone'            // ToneCheckerNode validates; re-routes or passes through
  | 'edit_content'          // EditorNode refines generationResult.draft
  | 'optimize_seo'          // SEOOptimizerNode enriches generationResult.seoMetadata
  | 'retrieve_context'      // Phase D: RagRetrievalNode fetches relevant library items
  | 'done'
  | 'error';

// ---------------------------------------------------------------------------
// Result shapes
// ---------------------------------------------------------------------------

export interface GenerationResult {
  draft: string;
  format: ArticleFormat;
  seoMetadata?: SEOMetadata;
}

export interface ToneValidation {
  passed: boolean;
  violations: string[];  // semantic descriptions, not keyword matches
  retryCount: number;    // hard cap: 2 — passthrough on 3rd attempt (see ADR)
}

export interface ContentContext {
  mediaUrl?: string;
  transcript?: string;    // raw or extracted transcript text
  userThoughts?: string;  // user's own framing / angle to explore
  libraryItemIds?: string[];
}

export interface RoutingDecision {
  primaryNode: BlogEngineNode;
  requiresRAG: boolean;
  confidence: number;  // 0–1
}

export interface BlogEngineMetadata {
  timestamp: string;
  model: string;
  nodeExecutionOrder: BlogEngineNode[];
}

// ---------------------------------------------------------------------------
// Node factory options (mirrors cv-builder NodeOptions)
// ---------------------------------------------------------------------------

export interface NodeOptions {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
