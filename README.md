# Card Game

## Introduction

A web-based card game project built with Svelte and TypeScript, focusing on dynamic card management and component-based rendering.

This project was developed to enhance versatility across evolving tech stacks and to create a free, fun gaming experience without any in-game purchases or financial involvement.

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
│   ├── assets/            # Project-specific assets and data
│   │   └── data/
│   │       └── types.json
│   ├── components/        # Shared UI components
│   │   └── navigator.svelte
│   ├── control/           # Data control logic
│   │   └── data.ts
│   ├── layout/            # Page layouts and view containers
│   │   ├── index.svelte
│   │   └── svelte/        # View-specific layouts
│   ├── lib/               # Utility logic and state
│   ├── ui/                # UI components
│   │   └── svelte/        # Svelte-based UI elements (card)
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

## Code of Conduct

All assets (images, icons, etc.) used in this project MUST be open source or properly licensed for use. Please ensure you have the right to include any media before submitting a pull request.

## Contributing

We welcome contributions! Even if you're new to coding, here's how you can help:

1. **Fork the repo:** Create your own copy of the project on GitHub.
2. **Clone it:** Download the project to your computer.
3. **Create a branch:** Start a new branch for your changes (e.g., `git checkout -b feature-name`).
4. **Make changes:** Add your features, fix bugs, or improve documentation.
5. **Commit & Push:** Save your changes using a descriptive commit message. We recommend following these formats:
   - `feat: Added something`
   - `fixed: Error on handler`
   - `docs: Updated documentation`
   Then upload them to your fork (`git push origin feature-name`).
6. **Pull Request:** Open a Pull Request on GitHub to share your changes with us.

## Changelogs

- **0.3.0** (2026-04-02)
  - Transitioned from Canvas-based rendering to Svelte component-based rendering
  - Removed Canvas management systems for improved DOM performance
  - Refined project structure into `layout`, `control`, and `ui` directories
- **0.2.1** (2026-04-02)
  - Updated README with project's purpose and free-to-play nature
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
