# BlogEngine

> AI-powered content creation and blog management system

BlogEngine is an intelligent blogging platform that helps content creators manage multiple writing contexts, juggle various topics simultaneously, and generate high-quality content with AI assistance.

## Features

- **Multi-Context Management**: Work on multiple blog posts, drafts, and content pieces simultaneously
- **AI-Powered Writing**: Built-in AI assistant for content generation, editing, and brainstorming
- **Persistent Chat**: Condensed chat interface that follows you across tabs (via `@ojfbot/frame-ui-components`)
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
│       │   ├── components/   # App-specific components & connected wrappers
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
- **UI Framework**: Carbon Design System (@carbon/react) + `@ojfbot/frame-ui-components`
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
  - `CondensedChat` - Persistent chat (imported from `@ojfbot/frame-ui-components`, connected via Redux wrapper)
  - `ThreadSidebarConnected` - Thread sidebar (imported from `@ojfbot/frame-ui-components`, connected via Redux wrapper)
  - `MarkdownMessage` - Renders markdown with badge action support (imported from `@ojfbot/frame-ui-components`)
  - `BadgeButton` - Interactive action buttons
  - `Dashboard` - Main layout with tabs (uses shared `DashboardLayout` from `@ojfbot/frame-ui-components`)

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
- **CI Secret Scanning**: TruffleHog secret detection runs automatically in the CI pipeline on every push/PR

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

## Related Projects

BlogEngine is part of the ojfbot fleet — a nine-repo architecture with a shell host (`@ojfbot/shell` at `frame.jim.software`), a shared component package (`@ojfbot/frame-ui-components`), and six Module Federation sub-apps:

- [Resume Builder (cv-builder)](https://github.com/ojfbot/cv-builder) - AI-powered resume builder
- [TripPlanner](https://github.com/ojfbot/TripPlanner) - Trip planning app
- [purefoy](https://github.com/ojfbot/purefoy) - Podcast/episodes dashboard
- [lean-canvas](https://github.com/ojfbot/lean-canvas) - Lean canvas tool
- [core-reader](https://github.com/ojfbot/core-reader) - Reading app

---

Built with ❤️ using React, TypeScript, and Carbon Design System
