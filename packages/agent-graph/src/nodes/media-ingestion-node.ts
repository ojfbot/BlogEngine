/**
 * MediaIngestionNode
 *
 * Phase B: textarea passthrough — sets contentContext.transcript from
 * state.contentContext.userThoughts so downstream nodes receive a usable string.
 *
 * Phase D: replace with real ingestion — RSS feed parsing, YouTube transcript
 * extraction, file upload processing (MP3/MP4/M4A). See domain-knowledge
 * blogengine-architecture.md issue #13 for the full media source list.
 *
 * SCAFFOLD: The passthrough behaviour is intentional for Phase B. The node
 * is in the graph so the Podcast Responder flow has the correct structure
 * from the start without requiring a media pipeline dependency in Phase B.
 */

import type { BlogEngineStateType } from '../state/schema.js';
import type { NodeFactory } from './types.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('media-ingestion-node');

export const createMediaIngestionNode: NodeFactory = (_options) => {
  return async (state: BlogEngineStateType): Promise<Partial<BlogEngineStateType>> => {
    logger.debug({ mediaUrl: state.contentContext?.mediaUrl }, 'MediaIngestionNode executing');

    // Phase B passthrough: treat userThoughts as the transcript.
    // Phase D TODO: fetch and extract transcript from mediaUrl.
    const transcript =
      state.contentContext?.transcript ??
      state.contentContext?.userThoughts ??
      '';

    return {
      currentAgent: 'media_ingestion',
      nodeExecutionOrder: ['media_ingestion'],
      contentContext: {
        ...state.contentContext,
        transcript,
      },
      nextAction: 'respond_to_podcast',  // always continues to conversation_context
    };
  };
};
