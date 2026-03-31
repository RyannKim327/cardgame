# Card Game

## Introduction
A web-based card game project built with Svelte and TypeScript, focusing on dynamic card management and canvas-based rendering.

## Tech Stack
- **Framework:** [Svelte 5](https://svelte.dev/)
- **Bundler:** [Vite 8](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Runtime:** Node.js

## File Structure
```text
cardgame/
├── public/                # Static assets (icons, images)
├── src/
│   ├── assets/            # Project-specific assets (logos)
│   ├── components/        # Shared UI components
│   │   └── navigator.svelte
│   ├── lib/               # Core logic and state management
│   │   ├── canvasManager.ts
│   │   └── canvasStore.ts
│   ├── ui/                # Layout and views
│   │   ├── index.svelte   # Main layout handler
│   │   ├── svelte/        # View components (game, user)
│   │   └── ts/            # Canvas rendering logic (card, button)
│   ├── app.css            # Global styles
│   ├── app.svelte         # Root application component
│   └── main.ts            # Entry point
├── index.html             # HTML template
├── LICENSE.md             # Project license
├── package.json           # Project metadata
├── svelte.config.js       # Svelte configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Changelogs
- **0.2.0** (2026-04-01)
  - Integrated dynamic layout navigation system
  - Separated Dashboard, Game, and Leaderboard views
  - Added Canvas-based Button system for manual rendering
  - Reorganized project structure under `src/ui`
- **0.1.1** (2026-03-31)
  - Added project documentation and LICENSE.md
- **0.1.0** (2026-03-31)
  - Added Dynamic Card count
  - Implemented core Carding functionality
  - Initial project setup
- **0.0.0**
  - Initial Commit
