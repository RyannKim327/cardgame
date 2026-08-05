# AGENT.md - Development & Architectural Guide for AI Assistants

## 📌 Project Overview
**Card Game: Elements (v2.0.0)** is an element-based card battle game built around the Periodic Table. It features high-performance asynchronous Rust backend services (Axum, Tokio, WebSockets) paired with a responsive HTML5 Canvas & Vanilla JavaScript client.

---


## 🏗️ Architecture & Component Overview

### Backend Architecture (`src/`)
- [`src/main.rs`](src/main.rs): Server entry point, Axum router initialization, static asset mounting (`/`), and integration tests.
- [`src/interface.rs`](src/interface.rs): Core data structures (`Element`, `User`, `BattleState`, `CardState`, `TraitRelation`).
- [`src/endpoints/`](src/endpoints/):
  - [`elements.rs`](src/endpoints/elements.rs): `GET /elements` — Serves element dataset.
  - [`traits.rs`](src/endpoints/traits.rs): `GET /traits` — Serves element trait relations dataset.
  - [`users.rs`](src/endpoints/users.rs): `GET /users` — Serves player profiles and decks.
  - [`login.rs`](src/endpoints/login.rs): `POST /login` — Authentication handler.
  - [`battle_ws.rs`](src/endpoints/battle_ws.rs): Real-time battle handlers (`/ws/battle`, `/ws/battle/{id}`) and matchmaking queue endpoint (`/ws/search`).
- [`src/utils/battle.rs`](src/utils/battle.rs): Authoritative server-side damage calculation, critical strike logic, element trait evaluation, and HP formulas (`calculate_damage`, `hp_computation`).
- [`src/utils/ws.rs`](src/utils/ws.rs): Low-level WebSocket frame reading and JSON frame encoding helpers.

### Frontend Architecture (`static/`)
- [`static/index.html`](static/index.html): Single-page application structure, modal overlays (login, deck selection, matchmaking queue, battle HUD).
- [`static/assets/style.css`](static/assets/style.css): Cyberpunk glassmorphic design system and animations.
- [`static/assets/process/battleEngine.js`](static/assets/process/battleEngine.js): Client-side battle state manager and dual-WebSocket client (`/ws/search` for matchmaking, `/ws/battle/{id}` for gameplay).
- [`static/assets/ui/battle.js`](static/assets/ui/battle.js): Battle HUD event handlers, mode selection (VS BOT AI / VS HUMAN), and matchmaking modal hooks.
- [`static/assets/widgets/card.js`](static/assets/widgets/card.js): HTML5 Canvas card renderer and visual effects.

---

## ⚡ Game Modes & WebSocket Workflow

1. **VS BOT AI Mode**:
   - Client connects directly to `/ws/battle/${randomBattleId}` with `{ type: "init", mode: "vs_ai" }`.
   - Server initializes player deck and a randomized Bot AI deck, streaming authoritative `StateSync` updates.

2. **VS HUMAN Mode (Random Matchmaking)**:
   - **Searching Phase**: Client connects to `/ws/search` with `{ type: "init", mode: "vs_human" }`.
   - **Queueing**: Backend adds player to `MATCHMAKING_QUEUE` and sends `{ type: "searching" }`.
   - **Match Found**: When two players are queued, backend creates a `PendingMatch` with a unique `pvp_xxxxxx` battle ID and broadcasts `{ type: "match_found", battleId: "pvp_xxxxxx", playerRole: "player1" | "player2" }`.
   - **Battle Phase**: Both clients disconnect from `/ws/search` and connect to `/ws/battle/${battleId}` to play the match in real time.

---

## 🛠️ Verification & Development Commands

Always verify changes by running the following commands in the workspace root:

```bash
# Verify Rust compilation and check for errors/warnings
cargo check

# Run the full unit and endpoint test suite
cargo test

# Launch local development server (bound to http://127.0.0.1:3000)
cargo run
```

---

## 📋 Guidelines for AI Agents

1. **Server-Authoritative Combat**: Combat logic, damage calculation, HP deduction, and turn progression MUST remain strictly on the Rust backend (`calculate_damage` in [`src/utils/battle.rs`](file:///home/mpop/Programming/rust-projects/cardgame/src/utils/battle.rs)). Never calculate combat results client-side.
2. **WebSocket Scoping**: Matchmaking logic belongs in `/ws/search`; active battle turn execution belongs in `/ws/battle/{id}`.
3. **Verification**: Always run `cargo check` and `cargo test` after modifying any Rust source file. Ensure all unit tests pass before completing tasks.
