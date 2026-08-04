# Card Game: Elements
### MPOP Reverse II [Ryann Kim Sesgundo]


A web-based card game centered around the elements of the Periodic Table. Originally built with Svelte and Node.js/Express, the project has transitioned to a high-performance, asynchronous backend architecture powered by **Rust** (Axum & Tokio) and an HTML5 Canvas-based frontend.

## Features

- **Element-Based Gameplay:** Cards represent chemical elements with unique properties, traits, and scientific attributes.
- **Scientific Element Stats:** Card attributes (such as Health/HP) are dynamically derived from element **Boiling Points** (`boiling_point_k` / `boiling_point_c`) alongside critical hit chances.
- **Interactive Battle Engine:** Animated turn-based combat with attack/defense phases, dynamic damage calculation, critical hit multipliers, and combat status popups.
- **Game Lobby & Authentication:** Interactive lobby navigation, user authentication screens, and profile/collection viewer.
- **Canvas & Animated UI:** High-performance rendering engine using HTML5 Canvas with dynamic background particle effects and modern glassmorphic UI overlay.
- **Rust Asynchronous Backend:** High-performance Axum web server handling REST API endpoints (`/elements`, `/traits`, `/users`, `/login`) and static file serving.
- **Automated Test Suite:** Tokio test suite verifying endpoint handlers and Serde JSON deserialization.

## Tech Stack

- **Backend:** [Rust](https://www.rust-lang.org/) with [Axum](https://github.com/tokio-rs/axum), [Tokio](https://tokio.rs/), and [Tower HTTP](https://github.com/tower-rs/tower-http)
- **Serialization:** [Serde](https://serde.rs/) & [serde_json](https://docs.rs/serde_json/)
- **Frontend:** Vanilla JavaScript (ES Modules), HTML5 Canvas, Modern CSS3

## File Structure

```text
cardgame/
├── data/                      # JSON datasets for elements, traits, and user profiles
│   ├── elements.json          # Periodic table element properties & stats
│   ├── traits.json            # Element trait multipliers and effects
│   └── user_data.json         # Player profiles, decks, and user credentials
├── src/                       # Rust backend source code
│   ├── endpoints/             # REST API endpoint handlers
│   │   ├── elements.rs        # GET /elements endpoint
│   │   ├── login.rs           # POST /login endpoint
│   │   ├── mod.rs             # Endpoints module declaration
│   │   ├── traits.rs          # GET /traits endpoint
│   │   └── users.rs           # GET /users endpoint
│   ├── interface.rs           # Data structures and Serde models
│   └── main.rs                # Axum server entry point, router, and test suite
├── static/                    # Frontend static assets and HTML
│   ├── index.html             # Main HTML page wrapper
│   └── assets/                # JS scripts, UI components, and CSS styles
│       ├── component/         # Reusable canvas visual components
│       │   └── background.js  # Animated canvas particle background engine
│       ├── process/           # Client-side core game mechanics
│       │   ├── api.js         # REST API communication client
│       │   ├── battleEngine.js# Turn-based battle state machine
│       │   └── score.js       # Damage, stats, and critical strike calculator
│       ├── ui/                # UI screens and modal view handlers
│       │   ├── auth.js        # User login and authentication UI
│       │   ├── battle.js      # Battle scene HUD controls and overlay
│       │   ├── lobby.js       # Game lobby interface and navigation
│       │   └── profile.js     # Player profile viewer and deck inspector
│       ├── widgets/           # Renderable canvas elements
│       │   └── card.js        # Card component renderer and visual animations
│       ├── main.js            # Main application entry point and scene manager
│       ├── style.css          # Visual styling, glassmorphic UI, and HUD overlay
│       └── utils.js           # Shared frontend utilities and math helpers
├── Cargo.toml                 # Rust crate dependencies and package manifest
├── LICENSE.md                 # Project license
├── CHANGELOG.md               # Version history and release notes
└── README.md                  # Project documentation
```

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (Edition 2024 / latest stable release)

### Installation & Running

1. Clone the repository:
   ```bash
   git clone https://github.com/RyannKim327/cardgame.git
   cd cardgame
   ```

2. Run the application:
   ```bash
   cargo run
   ```
   The application will start on `http://127.0.0.1:3000`.

3. Run unit and integration tests:
   ```bash
   cargo test
   ```

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full history of changes.

