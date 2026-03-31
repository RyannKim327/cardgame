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
│   ├── lib/               # Core logic and state management
│   │   ├── canvasManager.ts
│   │   └── canvasStore.ts
│   ├── ui/                # UI Components
│   │   ├── svelte/        # Svelte components (game, button)
│   │   └── ts/            # TypeScript UI logic (card)
│   ├── app.css            # Global styles
│   ├── app.svelte         # Main application component
│   └── main.ts            # Entry point
├── index.html             # HTML template
├── package.json           # Project metadata and dependencies
├── svelte.config.js       # Svelte configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Changelogs
- **0.1.0** (2026-03-31)
  - Added Dynamic Card count
  - Implemented core Carding functionality
  - Initial project setup
- **0.0.0**
  - Initial Commit
