import type { BlogEngineStateType } from '../state/schema.js';
import type { NodeOptions } from '../state/types.js';

export type { NodeOptions };

/** Standard LangGraph node function signature for BlogEngine. */
export type BlogEngineNodeFn = (
  state: BlogEngineStateType
) => Promise<Partial<BlogEngineStateType>>;

/** Factory function signature — each node file exports one of these. */
export type NodeFactory = (options: NodeOptions) => BlogEngineNodeFn;
