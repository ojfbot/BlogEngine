/**
 * BlogBeadLike — FrameBeadLike shape for BlogEngine threads/posts.
 *
 * Satisfies the FrameBeadLike contract defined in ADR-0016 (core repo).
 * Deliberately not imported from @core/workflows to avoid cross-repo coupling.
 *
 * Prefix: "blog-"
 * sourceApp: "blogengine"
 */

export type BlogBeadStatus = 'created' | 'live' | 'closed' | 'archived';

export interface BlogBead {
  id: string;
  type: 'draft';
  status: BlogBeadStatus;
  sourceApp: 'blogengine';
  created_at: string;
  updated_at: string;
  payload: {
    title: string;
    threadId: string;
    messageCount: number;
  };
}
