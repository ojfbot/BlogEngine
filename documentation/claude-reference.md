# BlogEngine reference (Layer 2)

Deep reference routed out of the always-loaded `CLAUDE.md` per loading-discipline (core ADR-0081). Read on demand when a task needs package internals, API surface, or setup detail.

## Package responsibilities

**@blogengine/agent-core**
- Core types, Zod schemas, and utilities
- Configuration management (`env.json` loading)
- Shared models: Article, ContentTypes, NotionMapping, Publishing, Thread, ThreadMessage
- Logger (Pino-based)
- **No LangGraph or agent logic** - pure foundational code

**@blogengine/agent-graph**
- LangGraph multi-agent orchestration (9 nodes, SQLite checkpointer)
- Nodes: OrchestratorNode, MediaIngestionNode, ConversationContextNode, ArticleGeneratorNode, PodcastResponderNode (decomposed into sub-components), ToneCheckerNode (hard cap=2), EditorNode, SEOOptimizerNode, RagRetrievalNode (Phase D stub)
- State: `BlogEngineState` with `messagesReducer` and `nodeOrderReducer` accumulators
- Depends on: agent-core, notion-integration, rag-service
- Uses `@langchain/anthropic`, `@langchain/langgraph`, `better-sqlite3`

**@blogengine/api**
- Express.js REST API backend (port **3006** — see ADR-001)
- Routes for chat, content generation, Notion sync, publishing, RAG
- Middleware: CORS, Helmet, rate limiting, JWT (`requireAuth`)
- Depends on all other packages (orchestration layer)

**@blogengine/browser-app**
- React 18 + TypeScript + Vite
- IBM Carbon Design System (v1.67) for UI
- Redux Toolkit for state management
- Components: InteractiveChat, CondensedChat, Dashboard, ProductLibrary, WorkingMemoryDashboard (decomposed into focused sub-components), NotionDashboard, PublishingDashboard, GenerateDashboard, PodcastResponder (decomposed into sub-components), ThreadSidebar
- Multithread conversation management with collapsible sidebar
- API client v2 with Server-Sent Events (SSE) for streaming chat
- Product-oriented framing: focus on published products across platforms
- Communicates with API via axios and EventSource

**@blogengine/notion-integration**
- Notion API wrapper and sync
- Handles bidirectional content sync with Notion databases

**@blogengine/publisher**
- Publishing platform integrations: Hugo, Jekyll, GitHub, WordPress, Medium, Dev.to
- Uses @octokit/rest for GitHub, simple-git for Git operations

**@blogengine/rag-service**
- Vector store and RAG capabilities
- Supports Pinecone, ChromaDB, FAISS
- Uses OpenAI embeddings (text-embedding-3-small by default)

**@blogengine/browser-automation**
- Present in `packages/` but not previously documented in CLAUDE.md (noted during the 2026-06-11 routing audit — fill in responsibilities when next touched)

## Build dependencies

Packages must be built in dependency order. The root `pnpm build` handles this automatically:
1. agent-core (no dependencies)
2. notion-integration, publisher, rag-service (depend on agent-core)
3. agent-graph (depends on agent-core, notion-integration, rag-service)
4. api (depends on all)
5. browser-app (depends on agent-core for types)

## TypeScript configuration

- Base config: `tsconfig.base.json` (strict mode, ES2022 target, ESNext modules)
- Each package extends the base config
- All packages use ES modules (`"type": "module"`)
- Module resolution: `"bundler"`
- Output: CommonJS with declarations for interop

## Workspace catalog

Dependencies are managed via PNPM workspace catalog in `pnpm-workspace.yaml`. When adding dependencies, check if they exist in the catalog first:
- TypeScript: `^5.6.3`
- Zod: `^3.23.8`
- Anthropic SDK: `^0.32.1`
- LangChain packages: `^0.3.x`
- React: `^18.3.1`
- Carbon: `^1.67.0`

## Workspace dependencies pattern

Internal packages reference each other via `workspace:*`:
```json
{
  "dependencies": {
    "@blogengine/agent-core": "workspace:*"
  }
}
```

## Configuration loading internals

Configuration is loaded via `@blogengine/agent-core/utils/config.ts`:
- Uses Zod schemas for validation
- Singleton pattern with `getConfig()` function
- See `packages/agent-core/env.json.example` for all available options

### First-time setup

```bash
# Copy the example file
cp packages/agent-core/env.json.example packages/agent-core/env.json

# Edit with your API keys
# Required: anthropicApiKey, openaiApiKey
# Optional: notionApiKey, githubToken, wordpressUrl, etc.
```

## Key API endpoints

### Content generation
- `POST /api/v1/chat/message` - Send message to agent (streaming)
- `POST /api/v1/content/generate` - Generate content
- `GET /api/v1/content` - List content
- `PUT /api/v1/content/:id` - Update content

### Notion sync
- `POST /api/v1/notion/connect` - Connect Notion
- `GET /api/v1/notion/databases` - List databases
- `POST /api/v1/notion/sync` - Trigger sync

### Publishing
- `GET /api/v1/publish/targets` - List publishing targets
- `POST /api/v1/publish/:articleId` - Publish article

### RAG
- `POST /api/v1/rag/index` - Index content
- `POST /api/v1/rag/search` - Semantic search

### Multithread conversations (v2)
- `GET /api/v2/threads` - List all conversation threads for user
- `POST /api/v2/threads` - Create new conversation thread
- `GET /api/v2/threads/:threadId` - Get thread with message history
- `PUT /api/v2/threads/:threadId` - Update thread metadata
- `DELETE /api/v2/threads/:threadId` - Delete conversation thread
- `POST /api/v2/chat` - Send chat message (non-streaming) via agent graph
- `GET /api/v2/chat/stream` - Stream chat responses via Server-Sent Events (SSE)
- `GET /api/v2/health` - Health check for v2 API
- `POST /api/v2/auth/token` - Issue JWT for a userId (Phase B: no credential check — Phase C adds verification)

## Development workflow (first run)

1. Clone and install: `pnpm install`
2. Configure API keys: `cp packages/agent-core/env.json.example packages/agent-core/env.json`
3. Build: `pnpm build`
4. Run: `pnpm dev:all`
5. Type check before committing: `pnpm type-check`
6. Security scan runs automatically on commit

## Common issues

**Build failures**: Ensure packages are built in order. Run `pnpm build` from root, not individual packages.

**Missing config**: If API fails to start, verify `packages/agent-core/env.json` exists with required keys (anthropicApiKey, openaiApiKey).

**Module resolution errors**: All imports must use `.js` extensions. TypeScript will compile `.ts` to `.js` but imports must reference `.js`.

**Pre-commit hook failures**: If blocked by security scan, check for API keys in staged files. Remove and re-stage.
