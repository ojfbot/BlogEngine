# ADR-002: ToneCheckerNode Retry Cap (Hard Cap at 2)

**Status**: Accepted
**Date**: 2026-02-26
**Deciders**: Engineering team

---

## Context

The BlogEngine podcast-responder flow enforces a collaborative, "yes, and…" tone. The flow is:

```
podcast_responder → tone_checker ─[fail]→ editor → tone_checker
                                ─[pass]→ seo_optimizer
```

The `ToneCheckerNode` uses an LLM to assess tone semantically. If the draft fails, it routes to `EditorNode`, which attempts to fix the violations. The fixed draft is then re-assessed by `ToneCheckerNode`.

**Problem**: If the user's original prompt consistently elicits confrontational content — either because the topic is inherently adversarial, or due to an adversarial prompt injection — the `editor → tone_checker` loop can repeat indefinitely, consuming tokens and blocking the response.

## Decision

Introduce a **hard retry cap** at `retryCount = 2` (constant `TONE_RETRY_CAP = 2`).

- On the first and second tone failures, `ToneCheckerNode` increments `retryCount` and routes to `EditorNode`.
- On the **third** assessment (when `retryCount >= TONE_RETRY_CAP`), `ToneCheckerNode` **forces a pass** and routes to `SEOOptimizerNode` without calling the LLM, regardless of the draft's actual tone.

The forced pass is annotated in state as `passed: true` but `violations` retains whatever was set from the previous failed assessment — preserving observability.

`OrchestratorNode` also reads `toneValidation.retryCount` at the start of each turn and short-circuits to `done` if the cap has already been reached, preventing re-entry into a broken loop across turns.

## Consequences

**Positive**:
- Prevents infinite retry loops from adversarial or structurally difficult prompts.
- Keeps worst-case latency bounded: at most 2 editor + 3 tone-checker LLM calls per generation.
- Hard cap is testable without a real LLM (pure state logic, tested in `tone-checker-node.test.ts`).

**Negative / risks**:
- In rare cases, content with genuine tone violations may be published after the cap is hit. This is a deliberate trade-off: better to deliver imperfect content than to block the user entirely.
- `passed: true` in the forced case is semantically misleading. Downstream code must not treat `toneValidation.passed` as a quality guarantee.

## Cap value rationale

`TONE_RETRY_CAP = 2` allows **one retry** (first fail → editor → re-check → second fail → editor → re-check → passthrough). This is sufficient for fixing genuine tone slip-ups while being small enough to keep latency reasonable.

If production data shows that 2 retries are consistently insufficient for typical content, the cap can be raised to 3 as a config value in a future phase.

## Alternatives considered

1. **No cap** — rejected due to infinite-loop risk.
2. **Cap of 1 (zero retries)** — too aggressive; single-shot tone checking has a non-trivial false-positive rate on nuanced content.
3. **Configurable cap via `env.json`** — deferred; adds complexity for a value unlikely to change per deployment. Can be revisited in Phase C.
