# Implementation notes

## Deviations

- 2026-10-01 (no loopback in prod): plan assumed blogengine's API client only needed its localhost default gated; territory: `api/client-v2.ts` defaulted to `localhost:3001` (cv-builder's API port) while the blogengine API listens on 3006 (`packages/api/src/constants.ts`) and SettingsPanel already assumed 3006. Unified both on one dev-only `DEFAULT_API_BASE_URL` = `localhost:3006/api/v2`.
- 2026-10-01 (no loopback in prod): plan's guard matched any `http://localhost`; territory: axios ships `'http://localhost'` as a URL-parsing base it never fetches. Narrowed `scripts/check-no-loopback.sh` to require a `:` (port) after the host; still verified to flag the pre-fix bundle and the old shipped cv-builder chunk.
