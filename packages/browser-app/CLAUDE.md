# browser-app — Claude guidance

Rules and patterns that apply when working in `packages/browser-app`.

## State management

Redux Toolkit slices: `navigationSlice`, `contentSlice`, `chatSlice`
- Use typed hooks from `src/store/hooks.ts`
- Prefer `useAppSelector` and `useAppDispatch`

## Carbon Design System

UI uses IBM Carbon components. Import from `@carbon/react`:
```typescript
import { Button, Theme, Grid } from '@carbon/react';
```

## Module Federation remote surface

`vite.config.ts` exposes two components:
- `./Dashboard` — loaded by the shell as the main content view
- `./Settings` — bare settings panel loaded inside the shell's `SettingsModal`

### Shared singletons (must match shell exactly)

Note: `@ojfbot/frame-ui-components` is consumed from npm (`^1.0.1`) rather than a `file:` reference (see commit 6ec5f5e).

```typescript
shared: {
  react:              { singleton: true, requiredVersion: '^18.3.1' },
  'react-dom':        { singleton: true, requiredVersion: '^18.3.1' },
  '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.5.0' },
  'react-redux':      { singleton: true, requiredVersion: '^9.2.0' },
  '@carbon/react':    { singleton: true, requiredVersion: '^1.67.0' },
} as any   // 'as any' required — singleton/requiredVersion typed as commented-out in plugin types
```

### Local MF dev

`@originjs/vite-plugin-federation` only generates `remoteEntry.js` on `vite build`, NOT `vite dev`.
For MF local dev: `pnpm --filter @blogengine/browser-app build && pnpm --filter @blogengine/browser-app preview`

### Shell Redux singleton

Settings panels use `useAppSelector` and `useAppDispatch` from the shell's Redux store singleton. Settings state lives in `shell/packages/shell-app/src/store/slices/settingsSlice.ts`.
