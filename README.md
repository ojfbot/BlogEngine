# BlogEngine

> AI-powered content creation and blog management system

BlogEngine is an intelligent blogging platform that helps content creators manage multiple writing contexts, juggle various topics simultaneously, and generate high-quality content with AI assistance.

## Features

- **Multi-Context Management**: Work on multiple blog posts, drafts, and content pieces simultaneously
- **AI-Powered Writing**: Built-in AI assistant for content generation, editing, and brainstorming
- **Persistent Chat**: Condensed chat interface that follows you across tabs
- **Interactive Workspace**: Dedicated interactive tab for focused AI collaboration
- **Badge Actions**: Quick action buttons for common content creation tasks
- **Carbon Design System**: Modern, accessible UI built with IBM Carbon Design System

## Architecture

BlogEngine is built as a monorepo using pnpm workspaces and Lerna:

```
blogengine/
├── packages/
│   └── browser-app/          # React + Vite frontend
│       ├── src/
│       │   ├── components/   # UI components
│       │   ├── store/        # Redux state management
│       │   └── App.tsx       # Main application
│       └── package.json
├── scripts/                  # Build and utility scripts
├── package.json              # Root package configuration
├── pnpm-workspace.yaml       # Workspace definition
└── lerna.json                # Monorepo configuration
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Carbon Design System (@carbon/react)
- **State Management**: Redux Toolkit
- **Build Tool**: Vite 5
- **Package Manager**: pnpm 9.15+
- **Monorepo**: Lerna + pnpm workspaces
- **Styling**: Sass (SCSS)
- **Component Development**: Storybook ~8.4.0

## Getting Started

### Prerequisites

- Node.js >= 24.11.1
- pnpm >= 9.15.4

### Installation

```bash
# Clone the repository
git clone https://github.com/ojfbot/blogengine.git
cd blogengine

# Install dependencies
pnpm install

# Setup husky hooks
pnpm exec husky

# Start development server
pnpm dev
```

The browser app will be available at http://localhost:3005

### Development

```bash
# Start dev server (browser-app)
pnpm dev

# Type check all packages
pnpm type-check

# Build all packages
pnpm build

# Run security verification
./scripts/security-verify.sh
```

## Project Structure

### Browser App (`packages/browser-app`)

The main frontend application built with React and Vite:

- **Components**:
  - `InteractiveChat` - Main chat interface with AI assistant
  - `CondensedChat` - Persistent chat using shared ChatShell
  - `ThreadSidebarConnected` - Redux wrapper for shared ThreadSidebar
  - `Dashboard` - Main layout using shared DashboardLayout + ErrorBoundary
  - Shared UI from `@ojfbot/frame-ui-components`: ChatShell, ChatMessage, MarkdownMessage, BadgeButton, ThreadSidebar, DashboardLayout, ErrorBoundary (ADR-0030)

- **State Management** (Redux):
  - `chatSlice` - Chat messages, drafts, display state
  - `contentSlice` - Content management
  - `navigationSlice` - Tab navigation

- **Features**:
  - Real-time markdown rendering
  - Badge action system for quick commands
  - Multi-tab interface (Interactive, Content, Drafts)
  - Responsive design with Carbon components

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add your environment variables here
# Example:
# API_URL=http://localhost:3000
```

### Package Manager

The project uses pnpm with specific configuration for Carbon Design System compatibility:

```ini
# .npmrc
auto-install-peers=true
strict-peer-dependencies=false
public-hoist-pattern[]=@carbon/*
public-hoist-pattern[]=@ibm/*
```

## Security

- **Pre-commit Hooks**: Automated checks for API keys and build artifacts
- **Gitignore**: Comprehensive ignore patterns for sensitive data
- **Security Audit**: Run `./scripts/security-verify.sh` to check for security issues

**Important**: Never commit:
- `env.json` or `.env` files
- Build artifacts (`dist/`, `build/`)
- API keys or secrets
- Personal content directories

## Scripts

### Root Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build all packages
- `pnpm type-check` - Run TypeScript type checking
- `pnpm storybook:build` - Build Storybook (also used as CI gate)
- `./scripts/security-verify.sh` - Run security audit

### Browser App Scripts

- `pnpm dev` - Start Vite dev server (port 3005)
- `pnpm build` - Build for production (TypeScript + Vite)
- `pnpm preview` - Preview production build
- `pnpm type-check` - Type check without emitting
- `pnpm storybook` - Start Storybook dev server
- `pnpm storybook:build` - Build Storybook for CI validation
## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm type-check` to ensure no type errors
4. Run `pnpm storybook:build` to ensure Storybook builds cleanly (CI will block merge if it doesn't)
5. Run `./scripts/security-verify.sh` to check security
6. Commit with clear, descriptive messages
7. Push and create a pull request

### Commit Conventions

We use conventional commits for clear history:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

## Roadmap

- [ ] Backend API integration
- [ ] Content persistence layer
- [ ] Multi-user support
- [ ] Advanced content editing tools
- [ ] Export capabilities
- [ ] Theme customization

## License

MIT

## Frame OS Ecosystem

Part of [Frame OS](https://github.com/ojfbot/shell) — an AI-native application OS.

| Repo | Description |
|------|-------------|
| [shell](https://github.com/ojfbot/shell) | Module Federation host + frame-agent LLM gateway |
| [core](https://github.com/ojfbot/core) | Workflow framework — 30+ slash commands + TypeScript engine |
| [cv-builder](https://github.com/ojfbot/cv-builder) | AI-powered resume builder with LangGraph agents |
| **blogengine** | **AI blog content creation platform (this repo)** |
| [TripPlanner](https://github.com/ojfbot/TripPlanner) | AI trip planner with 11-phase pipeline |
| [core-reader](https://github.com/ojfbot/core-reader) | Documentation viewer for the core framework |
| [lean-canvas](https://github.com/ojfbot/lean-canvas) | AI-powered lean canvas business model tool |
| [gastown-pilot](https://github.com/ojfbot/gastown-pilot) | Multi-agent coordination dashboard |
| [seh-study](https://github.com/ojfbot/seh-study) | NASA SEH spaced repetition study tool |
| [daily-logger](https://github.com/ojfbot/daily-logger) | Automated daily dev blog pipeline |
| [purefoy](https://github.com/ojfbot/purefoy) | Roger Deakins cinematography knowledge base |
| [MrPlug](https://github.com/ojfbot/MrPlug) | Chrome extension for AI UI feedback |
| [frame-ui-components](https://github.com/ojfbot/frame-ui-components) | Shared component library (Carbon DS) |
