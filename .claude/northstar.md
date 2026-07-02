---
type: northstar
slug: l1-blogengine
tier: L1
app: blogengine
ladders_up_to: l2-ojfbot
status: active
# Landed from the Northstar Roadtrip leg-5 blogengine card (voice-CONFIRMED 2026-06-28,
# landed 2026-07-02). CONFIRMED block pinned refs @0.1.0 — semver-on-refs is DESIGNED, not in
# schema v1.1, so refs here are unpinned; pins recorded in the offsite schema-evolution log.
properties:
  - id: P1
    name: "The factory diversifies output"
    target: "Config-driven pipelines emit content to multiple platforms (Hugo/WordPress/Medium/Notion) in multiple formats; the dead ContentTypeSchema taxonomy drives content-type-conditioned generator nodes via the nextAction router; the export {} stubs (publisher, notion-integration, rag-service) are real implementations."
    current: 15
    verification: "each declared publisher target has a working implementation with integration tests (not just a Zod schema); generator branches on content-type rather than one generic prompt; a single config change adds/removes a pipeline target without code edits."
    ladders_up_to: "ns:l2-ojfbot#P1"
    okr_drivers: []
  - id: P2
    name: "The tone guarantee is measured and honest"
    target: "The collaborative 'yes, and...' tone is verified with a real, measured pass-rate; the silent force-pass after TONE_RETRY_CAP=2 (which sets passed:true with violations intact) is removed or surfaced; an eval measures how often the cap fires."
    current: 8
    verification: "ToneCheckerNode never reports passed:true while violations remain; an eval reports the true tone-pass rate and the force-pass frequency over a corpus; the differentiator's % is backed by a measured number, not an unmeasured escape hatch."
    ladders_up_to: "ns:l2-ojfbot#P2"
    okr_drivers: []
---

# Northstar — blogengine (L1)

**Vision.** Blog-engine is the real agent factory for publishing pipelines: config-driven pipelines
that take generated content and emit it across multiple formats and platforms (Hugo, WordPress,
Medium, Notion), with the declared-but-stubbed capabilities filled in. Today it is a factory that
makes exactly one thing — markdown blog drafts from a single hard-wired 9-node LangGraph graph —
with `publisher`, `notion-integration`, and `rag-service` as empty stubs and a dead content-type
taxonomy the generator ignores. The compass is to decompose that monolith back into a true factory
of pipelines, and to make its signature differentiator (the collaborative "yes, and..."
Media/Podcast Responder tone) honestly measured rather than silently force-passed. It is the shared
publishing layer the fleet's teaching harnesses route into — a plug-in, not part of any single
domain stack.

## P1 — The factory diversifies output

Ladders to `ns:l2-ojfbot#P1` (delivery) — multi-format/multi-platform publishing is exactly
delivery. The 15% counts behavior, not schemas: the Zod blueprints are finished designs with zero
implementation. LADDER_STRESS at land: **l2#P1=clean**.

## P2 — The tone guarantee is measured and honest

Ladders to `ns:l2-ojfbot#P2` (legibility). Current is near-zero not because the tone is bad but
because the force-pass makes the present pass-rate unprovable — making the verification honest IS
the self-measurement property. LADDER_STRESS: **l2#P2=clean**.

## Synthesis notes (from the confirmed leg)

Teaching-artifact ingestion from f1-pit-wall does **not** exist today (no inbound
structured-content endpoint; `MediaIngestionNode` is a passthrough stub; the only planned inbound
pipeline is daily-logger → blogengine, Phase 9, unbuilt) — so pit-wall → blogengine is a named 0%
aspiration, **not** a `depends_on`; it becomes a real edge when an inbound endpoint is specced.
Security: `/api/tools` is off-contract (diverges from ADR-0007) and Phase-C-blocked (TD-009/011/017
— uncredentialed JWT issuance, no userId filtering, cross-user exposure) — the same zero-trust axis
as shell's P3. Candidate property deferred pending James's call: the advertised-vs-built capability
gap as an honesty property (logged, not authored).
