# Technical Debt

Last updated: 2026-02-26 (PR #17 review pass)

| ID | Severity | Kind | Location | Description | Effort | Status |
|----|----------|------|----------|-------------|--------|--------|
| TD-001 | HIGH | security | `packages/api/src/server.ts` | No authentication on `/api/v2/*` routes. | M | resolved |
| TD-002 | HIGH | architecture | `packages/agent-graph/src/index.ts` | `@blogengine/agent-graph` was a single `export {}` — no LangGraph state schema, no nodes, no graph, no checkpointer. All AI responses were randomly-selected mock strings. | L | resolved |
| TD-003 | HIGH | test-coverage | `packages/` | Zero automated tests across the entire monorepo. `vitest` is in `devDependencies` but there is no `vitest.config.ts` and no `.test.ts` or `.spec.ts` files anywhere. Target: ≥80% line coverage on `@blogengine/api` and `@blogengine/agent-graph`. | L | partial |
| TD-004 | HIGH | architecture | `packages/api/src/services/thread-service.ts` | All thread and message data lived in a `Map<string, ThreadWithMessages>`. Every server restart destroyed all conversation history. | M | resolved |
| TD-005 | MEDIUM | architecture | `packages/agent-graph/src/index.ts`, `packages/notion-integration/src/index.ts`, `packages/publisher/src/index.ts`, `packages/rag-service/src/index.ts` | Four packages registered in the monorepo are empty stubs (`export {}`). They appear in `CLAUDE.md` as implemented features but contain no code. Misleads onboarding; bloats the dependency graph. Phase D implements each. | L | open |
| TD-006 | MEDIUM | security | `packages/api/src/services/chat-service.ts` | `ChatService.streamChat` simulated token streaming with `delay(50)` between words. This was test-visible behaviour (timing-dependent) and masked the absence of a real streaming implementation. | S | resolved |
| TD-007 | LOW | maintainability | `packages/api/src/server.ts:85-86` | Two `console.log` calls in the production server startup path. The project uses Pino via `@blogengine/agent-core`'s `logger` — these should use `logger.info` for consistency with the rest of the codebase and to respect log-level configuration. | S | open |
| TD-008 | LOW | maintainability | `packages/browser-app/src/api/client-v2.ts:203` | `console.error('API health check failed:', error)` in the browser API client. Bare `console.error` is not observable in production. Should either be removed (health check failures are surfaced via UI state) or replaced with a structured logger if one is added to the browser layer. | S | open |
| TD-009 | HIGH | security | `packages/api/src/routes/v2/auth.ts` | `POST /api/v2/auth/token` issues a JWT for any `userId` without credential verification — no password, no session check. Phase C must add real credential validation before this endpoint is exposed externally. `mockAuth` must be `false` before merging Phase C. | M | open |
| TD-010 | MEDIUM | architecture | `packages/api/src/services/chat-service.ts` | `streamChat` emits draft words after the graph completes rather than streaming per-LLM-token. Switch to `graph.streamEvents()` in Phase C for true SSE token streaming. | M | open |
| TD-011 | MEDIUM | security | `packages/api/src/routes/v2/threads.ts` | Thread routes do not filter by `req.userId` — any authenticated user can read or delete any thread. Ownership enforcement deferred to Phase C. | S | open |
| TD-012 | LOW | performance | `packages/api/src/services/thread-service.ts` | `ThreadService` calls `writeFileSync` (synchronous) on every mutation. Under load this blocks the event loop. Replace with async writes or a write-ahead buffer. Phase C. | S | open |
| TD-013 | MEDIUM | architecture | `packages/browser-app/src/components/PodcastResponder.tsx` | Chat responses in PodcastResponder are randomly-selected mock strings. Wire to `POST /api/v2/chat` with `respond_to_podcast` intent. Phase C. | M | open |
| TD-014 | MEDIUM | test-coverage | `packages/browser-app/src/` | No Vitest/React Testing Library tests for any browser-app components (WorkingMemoryDashboard, PodcastResponder, InteractiveChat, etc.). Phase C. | L | open |
| TD-015 | LOW | maintainability | `packages/browser-app/src/components/WorkingMemoryDashboard.tsx` | Working memory stored in `localStorage` with no migration strategy, no size limit enforcement, and no server sync. Large transcripts will exhaust the 5 MB quota. Phase C: move to `POST /api/v2/working-memory`. | M | open |
| TD-016 | HIGH | security | `packages/api/src/server.ts` | `/api/posts` is now protected by `requireAuth`, but frame-agent still calls it without a Bearer token. `mockAuth=true` is required locally until frame-agent is updated to pass its service JWT. Phase C. | S | open |

## Resolution notes

| ID | Resolved in | Notes |
|----|-------------|-------|
| TD-001 | Phase B | JWT `requireAuth` middleware on all `/api/v2/*` routes. `POST /api/v2/auth/token` issues tokens. `mockAuth=true` bypass available for dev (must be `false` in prod — see TD-009). |
| TD-002 | Phase B | Full 9-node LangGraph graph implemented with `ChatAnthropic` calls. SQLite checkpointer. `chat-service.ts` wired to real graph. |
| TD-004 | Phase B | `ThreadService` persists to `packages/api/.data/threads.json`. Survives server restarts. |
| TD-006 | Phase B | `streamChat` replaced with `graph.stream()` (node-level events) + word emission of final draft. |

## Notes

- **TD-003** is partial: `@blogengine/agent-graph` now has `vitest.config.ts` and 2 passing + 14 todo tests. Full coverage work tracked separately.
- **TD-005** (empty stubs): the packages themselves are not harmful, but they should carry explicit `// NOT IMPLEMENTED — Phase D` banners rather than silent `export {}` to avoid confusion.
- **TD-009, TD-010, TD-011** are Phase C prerequisites.
- The `/api/posts` endpoint added in Phase A deliberately omits `userId` from responses — this is correct and not a debt item.
- **TD-013** is already referenced in `PodcastResponder.tsx` via inline `// TECHDEBT TD-013` comment.
- **TD-016** is already referenced in `server.ts` via inline comment. Unblock by updating frame-agent to pass service JWT before Phase C merge.
