# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

BlogEngine is an AI-powered blog and documentation generation system built as a **PNPM monorepo** with Lerna. It features multi-agent orchestration via LangGraph, Notion integration, RAG capabilities, and multi-platform publishing.

Routed guidance (loading-discipline, core ADR-0081):
- `packages/browser-app/CLAUDE.md` — Redux/Carbon patterns + Module Federation remote config (loads when editing browser-app)
- `documentation/claude-reference.md` — package responsibilities, build order, TS config, workspace catalog, API endpoint map, setup walkthrough, troubleshooting (read on demand)

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
pnpm dev              # Browser UI at http://localhost:3005

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
# @blogengine/browser-automation
# @blogengine/notion-integration
# @blogengine/publisher
# @blogengine/rag-service
```

### Testing & Quality

```bash
pnpm test             # Run all package tests from root

pnpm lint             # Lint all packages
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

API keys and environment are loaded with this hierarchy (highest to lowest priority):

1. **`packages/agent-core/env.json`** (primary, gitignored)
2. **`.env.local`** (secondary, gitignored)
3. **Environment variables** (fallback)

**CRITICAL**: `env.json`, `.env`, and `.env.local` are gitignored. Pre-commit hooks actively scan for API key leaks. Never commit these files or hardcode API keys.

Setup walkthrough and config-loading internals: `documentation/claude-reference.md`.

## API Auth Invariant

All `/api/v2/*` routes (except `/api/v2/auth/token`) require `Authorization: Bearer <token>`. Set `mockAuth: true` in `env.json` to bypass JWT for local dev (must be `false` before Phase C merge — see TECHDEBT TD-009).

## Security Considerations

**Pre-commit Hook**: `.husky/pre-commit` runs `scripts/security-scan.sh` which:
- Scans staged TypeScript/JavaScript/JSON files for API key patterns
- Blocks commits containing: `sk-ant-*`, `sk-*`, `secret_*`, `ghp_*`
- Prevents accidental commits of `env.json`, `.env`, `.env.local`

**API Key Isolation**: Browser app never receives API keys. All AI and integration calls go through the backend API.

**Rate Limiting**: API uses express-rate-limit to prevent abuse.

## Code Style

All imports use `.js` extensions even for TypeScript files (ES module requirement):
```typescript
export * from './models/index.js';
import { logger } from './utils/logger.js';
```

## Frame OS Integration

BlogEngine is a **Module Federation remote** in the Frame OS cluster (see `domain-knowledge/frame-os-context.md`). MF remote surface, shared singletons, and local MF dev workflow: `packages/browser-app/CLAUDE.md`.

### Production deployment

blog.jim.software (Vercel) — auto-deploys on push to main.
Branch protection: PR required, rebase-only merge (GitHub Ruleset).

## Deployment

**NEVER deploy directly to production** via CLI (`vercel deploy --prod`, `vercel promote`, etc.).
All production deployments go through the GitHub PR → CI → merge → automated deploy pipeline.
The only exception is `workflow_dispatch` for manual CI triggers.
Local Vercel CLI usage is restricted to preview deploys only.
