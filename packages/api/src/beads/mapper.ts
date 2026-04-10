import type { Thread, ThreadWithMessages } from '@blogengine/agent-core';
import type { BlogBead, BlogBeadStatus } from './types.js';

function deriveStatus(_thread: Thread | ThreadWithMessages): BlogBeadStatus {
  return 'live';
}

export function mapThreadToBead(thread: Thread | ThreadWithMessages): BlogBead {
  const messages = 'messages' in thread ? thread.messages : [];
  return {
    id: `blog-${thread.threadId}`,
    type: 'draft',
    status: deriveStatus(thread),
    sourceApp: 'blogengine',
    created_at: thread.createdAt,
    updated_at: thread.updatedAt,
    payload: {
      title: thread.title ?? 'Untitled',
      threadId: thread.threadId,
      messageCount: messages.length,
    },
  };
}
