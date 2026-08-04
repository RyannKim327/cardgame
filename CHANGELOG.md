# Changelog

All notable changes to this project will be documented in this file.

## 2.0.0 (2026-08-04)
- **Rust Backend Migration:** Rewrote the backend server from Node.js/Express to Rust utilizing [Axum](https://github.com/tokio-rs/axum) (`0.8.9`), [Tokio](https://tokio.rs/) (`1.53.1`), and [Tower HTTP](https://github.com/tower-rs/tower-http) (`0.7`).
- **Static Asset Restructuring:** Relocated and organized frontend HTML, JavaScript components, and CSS into the `static/` directory served directly via `tower_http::services::ServeDir`.
- **Typed REST API Endpoints:** Built strongly-typed handlers in `src/endpoints/` (`elements.rs`, `login.rs`, `traits.rs`, `users.rs`) backed by Serde data models in `src/interface.rs`.
- **Automated Testing:** Integrated an asynchronous test suite in `src/main.rs` covering JSON deserialization and authentication logic.

## 1.2.0 (2026-08-04)
- **Boiling Point Stat Integration:** Replaced standard card HP with element Boiling Points (`boiling_point_k` / `boiling_point_c`) across element datasets, battle logic, and card status rendering.
- **Critical Strike Mechanics:** Introduced critical hit chances and dynamic critical multiplier damage during battle turn resolutions.
- **Battle Resolution Refinement:** Updated combat formulas and score computation in `battleEngine.js` and `score.js` to incorporate critical strikes and boiling point stats.

## 1.1.0 (2026-08-03)
- **Interactive Battle Engine:** Introduced `battleEngine.js` supporting dynamic turn-based element battles, combat animations, phase transitions, and visual damage popups.
- **Game Lobby & Authentication:** Added a game lobby interface (`lobby.js`), user authentication UI (`auth.js`), and user profile viewer (`profile.js`).
- **User Data Backend:** Created `user_data.json` and REST API endpoints (`/users`, `/login`, `/user/:username/cards`) for user persistence and card collection retrieval.
- **Animated Components:** Implemented dynamic canvas background particle systems (`background.js`) and battle status overlays (`battle.js`).
- **UI & Styling Overhaul:** Redesigned game styles using modern glassmorphism layouts, battle animations, and modal overlays (`style.css`).

## 1.0.1 (2026-06-09)
- **Canvas Bounds Fix:** Resolved canvas background element rendering out-of-bounds issue.
- **Initialization Fix:** Fixed game load error during initial canvas setup (`main.js`).
- **Documentation & Note Tags:** Added JSDoc inline note tags across card widget, score engine, and UI modules.

## 1.0.0 (2026-06-08)
- **Architectural Shift:** Migrated from Svelte/Next.js to a streamlined HTML5 Canvas and Express implementation.
- **Backend Setup:** Established a robust Express server to serve static files and JSON data.
- **Canvas Engine:** Initialized a new rendering system using Canvas for improved flexibility and performance.
- **Simplified Structure:** Reorganized the project for better maintainability and clarity.
- **Card Mechanics:** Implemented damage calculation logic for gameplay.
- **Card Rarity:** Introduced a rarity system with visual distinctions in card rendering.
- **API Improvements:** Refined data fetching and state management for smoother card interactions.
- **UI Polishing:** Enhanced card visual presentation with updated text colors and styles.

## 0.5.0 (2026-06-04)
- **Periodic Table Integration:** Added comprehensive data for chemical elements.
- **Data Expansion:** Introduced `elements.json` and `traits.json` to power game logic.

## 0.4.0 (2026-04-04)
- Implemented card `fight` function and improved card frame design.
- Added rarity-based colorization and collection categories for cards.
- Fixed weighted winner selection and broken tie-break logic.
- Integrated Svelte 5 `onclick` event handlers.
- Polished legendary animations.

## 0.3.0 (2026-04-02)
- Transitioned from Canvas-based rendering to Svelte component-based rendering (later reverted in 1.0.0).
- Refined project structure into `layout`, `control`, and `ui` directories.

## 0.2.0 (2026-04-01)
- Integrated dynamic layout navigation system.
- Separated Dashboard, Game, and Leaderboard views.
- Added Canvas-based Button system for manual rendering.

## 0.1.0 (2026-03-31)
- Initial core carding functionality.
- Implemented dynamic card count.
- Project setup.
