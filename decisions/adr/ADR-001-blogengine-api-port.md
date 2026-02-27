# ADR-001: BlogEngine API Port Assignment (3006)

**Status**: Accepted
**Date**: 2026-02-26
**Deciders**: Engineering team

---

## Context

BlogEngine runs as a sub-app inside the Frame OS architecture. Frame OS uses a shell (port 4000) that hosts Module Federation remotes, and frame-agent (port 4001) as the single LLM gateway. Sub-apps each own a port range to avoid conflicts.

The BlogEngine API was originally scaffolded at port 3001. During Phase A integration planning it was discovered that:

1. `cv-builder`'s API also uses port 3001 (the legacy default).
2. `frame-agent`'s `BlogEngineDomainAgent` already hard-codes `blogEngineApiUrl` pointing at port **3006**.
3. The port layout documented in `domain-knowledge/frame-os-context.md` assigns:
   - 3001 — cv-builder API
   - 3006 — BlogEngine API
   - 3011 — TripPlanner API

Running two services on the same port makes simultaneous local development impossible.

## Decision

Change `DEFAULT_PORT` in `packages/api/src/constants.ts` from 3001 to **3006**.

No environment variable override is added at this stage — port conflicts in CI are caught early by running both services simultaneously. A `PORT` environment variable override already exists for production deployments.

## Consequences

**Positive**:
- Aligns with frame-agent's hard-coded expectation — `BlogEngineDomainAgent.fetchPosts()` works without additional configuration.
- Eliminates port conflict when cv-builder and BlogEngine are running simultaneously.
- Consistent with the Frame OS sub-app port layout documented in domain-knowledge.

**Negative / risks**:
- Any existing `env.json`, shell scripts, or documentation that referenced port 3001 must be updated.
- frame-agent's `blogEngineApiUrl` remains hard-coded. A Phase C task will externalise it as an environment variable.

## Alternatives considered

1. **Keep 3001, change cv-builder** — rejected because cv-builder is the older project and changing it would require updating more downstream references.
2. **Dynamic port negotiation** — over-engineered for a local dev environment; deferred to Phase C if needed.
