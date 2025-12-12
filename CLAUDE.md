# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

BlogEngine is an AI-powered blog and documentation generation system built as a **PNPM monorepo** with Lerna. It features multi-agent orchestration via LangGraph, Notion integration, RAG capabilities, and multi-platform publishing.

## Essential Commands

### Development

```bash
# Install dependencies (required after clone)
pnpm install

# Build all packages (required before first run)
pnpm build

# Start both API and UI concurrently
pnpm dev:all

# Start individual services
pnpm dev:api          # API server at http://localhost:3001
pnpm dev              # Browser UI at http://localhost:3000

# Type checking
pnpm type-check       # Check all packages
```

### Working with Individual Packages

```bash
# Run commands in specific packages
pnpm --filter @blogengine/agent-core build
pnpm --filter @blogengine/api dev

# Available package names:
# @blogengine/agent-core
# @blogengine/agent-graph
# @blogengine/api
# @blogengine/browser-app
# @blogengine/notion-integration
# @blogengine/publisher
# @blogengine/rag-service
```

### Testing & Quality

```bash
# No test suite currently exists - tests should be added using vitest
# vitest is configured in the root devDependencies

pnpm lint             # Lint all packages
pnpm format           # Format with Prettier
```

### Security

```bash
pnpm security:check   # Run comprehensive security scan
pnpm security:verify  # Verify security configuration
pnpm security:scan    # Scan staged files (runs in pre-commit hook)
```

### Maintenance

```bash
pnpm clean            # Clean all build outputs and node_modules
```

## Configuration

### API Keys and Environment

Configuration is loaded with this hierarchy (highest to lowest priority):

1. **`packages/agent-core/env.json`** (primary, gitignored)
2. **`.env.local`** (secondary, gitignored)
3. **Environment variables** (fallback)

To set up:

```bash
# Copy the example file
cp packages/agent-core/env.json.example packages/agent-core/env.json

# Edit with your API keys
# Required: anthropicApiKey, openaiApiKey
# Optional: notionApiKey, githubToken, wordpressUrl, etc.
```

**CRITICAL**: `env.json`, `.env`, and `.env.local` are gitignored. Pre-commit hooks actively scan for API key leaks. Never commit these files or hardcode API keys.

### Configuration Loading

Configuration is loaded via `@blogengine/agent-core/utils/config.ts`:
- Uses Zod schemas for validation
- Singleton pattern with `getConfig()` function
- See `packages/agent-core/env.json.example` for all available options

## Architecture

### Package Responsibilities

**@blogengine/agent-core**
- Core types, Zod schemas, and utilities
- Configuration management (`env.json` loading)
- Shared models: Article, ContentTypes, NotionMapping, Publishing
- Logger (Pino-based)
- **No LangGraph or agent logic** - pure foundational code

**@blogengine/agent-graph**
- LangGraph multi-agent orchestration
- Agent nodes: OrchestratorNode, ArticleGeneratorNode, TutorialGeneratorNode, DocumentationGeneratorNode, ResearchAgentNode, SEOOptimizerNode, EditorAgentNode, NotionSyncNode, PublishingNode
- Depends on: agent-core, notion-integration, rag-service
- Uses Anthropic SDK, LangChain, OpenAI

**@blogengine/api**
- Express.js REST API backend (port 3001)
- Routes for chat, content generation, Notion sync, publishing, RAG
- Middleware: CORS, Helmet, rate limiting
- Depends on all other packages (orchestration layer)

**@blogengine/browser-app**
- React 18 + TypeScript + Vite
- IBM Carbon Design System (v1.67) for UI
- Redux Toolkit for state management
- Components: InteractiveChat, CondensedChat, Dashboard, ContentLibrary, NotionDashboard, PublishingDashboard, GenerateDashboard, SettingsDashboard
- Communicates with API via axios

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

### Build Dependencies

Packages must be built in dependency order. The root `pnpm build` handles this automatically:
1. agent-core (no dependencies)
2. notion-integration, publisher, rag-service (depend on agent-core)
3. agent-graph (depends on agent-core, notion-integration, rag-service)
4. api (depends on all)
5. browser-app (depends on agent-core for types)

### TypeScript Configuration

- Base config: `tsconfig.base.json` (strict mode, ES2022 target, ESNext modules)
- Each package extends the base config
- All packages use ES modules (`"type": "module"`)
- Module resolution: `"bundler"`
- Output: CommonJS with declarations for interop

### Workspace Catalog

Dependencies are managed via PNPM workspace catalog in `pnpm-workspace.yaml`. When adding dependencies, check if they exist in the catalog first:
- TypeScript: `^5.6.3`
- Zod: `^3.23.8`
- Anthropic SDK: `^0.32.1`
- LangChain packages: `^0.3.x`
- React: `^18.3.1`
- Carbon: `^1.67.0`

## Key API Endpoints

### Content Generation
- `POST /api/v1/chat/message` - Send message to agent (streaming)
- `POST /api/v1/content/generate` - Generate content
- `GET /api/v1/content` - List content
- `PUT /api/v1/content/:id` - Update content

### Notion Sync
- `POST /api/v1/notion/connect` - Connect Notion
- `GET /api/v1/notion/databases` - List databases
- `POST /api/v1/notion/sync` - Trigger sync

### Publishing
- `GET /api/v1/publish/targets` - List publishing targets
- `POST /api/v1/publish/:articleId` - Publish article

### RAG
- `POST /api/v1/rag/index` - Index content
- `POST /api/v1/rag/search` - Semantic search

## Security Considerations

**Pre-commit Hook**: `.husky/pre-commit` runs `scripts/security-scan.sh` which:
- Scans staged TypeScript/JavaScript/JSON files for API key patterns
- Blocks commits containing: `sk-ant-*`, `sk-*`, `secret_*`, `ghp_*`
- Prevents accidental commits of `env.json`, `.env`, `.env.local`

**API Key Isolation**: Browser app never receives API keys. All AI and integration calls go through the backend API.

**Rate Limiting**: API uses express-rate-limit to prevent abuse.

## Code Style & Patterns

### Import Paths
All imports use `.js` extensions even for TypeScript files (ES module requirement):
```typescript
export * from './models/index.js';
import { logger } from './utils/logger.js';
```

### Workspace Dependencies
Internal packages reference each other via `workspace:*`:
```json
{
  "dependencies": {
    "@blogengine/agent-core": "workspace:*"
  }
}
```

### State Management (Browser App)
Redux Toolkit slices: `navigationSlice`, `contentSlice`, `chatSlice`
- Use typed hooks from `src/store/hooks.ts`
- Prefer `useAppSelector` and `useAppDispatch`

### Carbon Design System
UI uses IBM Carbon components. Import from `@carbon/react`:
```typescript
import { Button, Theme, Grid } from '@carbon/react';
```

## Development Workflow

1. Clone and install: `pnpm install`
2. Configure API keys: `cp packages/agent-core/env.json.example packages/agent-core/env.json`
3. Build: `pnpm build`
4. Run: `pnpm dev:all`
5. Type check before committing: `pnpm type-check`
6. Security scan runs automatically on commit

## Common Issues

**Build failures**: Ensure packages are built in order. Run `pnpm build` from root, not individual packages.

**Missing config**: If API fails to start, verify `packages/agent-core/env.json` exists with required keys (anthropicApiKey, openaiApiKey).

**Module resolution errors**: All imports must use `.js` extensions. TypeScript will compile `.ts` to `.js` but imports must reference `.js`.

**Pre-commit hook failures**: If blocked by security scan, check for API keys in staged files. Remove and re-stage.
