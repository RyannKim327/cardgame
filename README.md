# Card Game: Elements
### MPOP Reverse II [Ryann Kim Sesgundo]


A web-based card game centered around the elements of the Periodic Table. Originally built with Svelte, the project has transitioned to a lightweight, high-performance architecture using an Express backend and an HTML5 Canvas-based frontend.

## Features

- **Element-Based Gameplay:** Cards represent chemical elements with unique properties, traits, and scientific attributes.
- **Scientific Element Stats:** Card attributes (such as Health/HP) are dynamically derived from element **Boiling Points** (`boiling_point_k` / `boiling_point_c`) alongside critical hit chances.
- **Interactive Battle Engine:** Animated turn-based combat with attack/defense phases, dynamic damage calculation, critical hit multipliers, and combat status popups.
- **Game Lobby & Authentication:** Interactive lobby navigation, user authentication screens, and profile/collection viewer.
- **Canvas & Animated UI:** High-performance rendering engine using HTML5 Canvas with dynamic background particle effects and modern glassmorphic UI overlay.
- **RESTful API & Data Persistence:** Express backend serving element datasets, traits, and user profile persistence (`user_data.json`).
- **Lightweight Design:** Minimal dependencies for fast loading and easy deployment.

## Tech Stack

- **Backend:** [Express](https://expressjs.com/) (Node.js)
- **Frontend:** Vanilla JavaScript (ES Modules), HTML5 Canvas, Modern CSS3
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Backend)
- **Execution:** [tsx](https://github.com/privatenumber/tsx) for seamless TypeScript execution

## File Structure

```text
cardgame/
├── data/                  # JSON data for elements, traits, and user profiles
│   ├── elements.json      # Periodic table element properties & stats
│   ├── traits.json        # Element trait multipliers and effects
│   └── user_data.json     # Player profiles, decks, and user credentials
├── public/                # Static assets, UI components, and rendering logic
│   ├── main.js            # Main application entry point and scene manager
│   ├── style.css          # Visual styling, glassmorphic UI, and battle HUD overlay
│   ├── utils.js           # Shared frontend utilities and math helpers
│   ├── component/         # Reusable canvas visual components
│   │   └── background.js  # Animated canvas particle background engine
│   ├── process/           # Client-side core game mechanics
│   │   ├── api.js         # REST API communication client
│   │   ├── battleEngine.js# Turn-based battle state machine & flow controller
│   │   └── score.js       # Damage, stats, and critical strike calculator
│   ├── ui/                # UI screens and modal view handlers
│   │   ├── auth.js        # User login and authentication UI
│   │   ├── battle.js      # Battle scene HUD controls and overlay
│   │   ├── lobby.js       # Game lobby interface and navigation
│   │   └── profile.js     # Player profile viewer and deck inspector
│   └── widgets/           # Renderable canvas elements
│       └── card.js        # Card component renderer, frames, and visual animations
├── src/
│   ├── index.ts           # Express server & REST API endpoints
│   └── template/
│       └── index.html     # HTML5 application template and container
├── LICENSE.md             # Project license
├── package.json           # Project metadata and dependencies
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RyannKim327/cardgame.git
   cd cardgame
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm start
```
The application will be available at `http://localhost:3000`.

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full history of changes.
