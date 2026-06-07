# Card Game: Elements
### MPOP Reverse II [Ryann Kim Sesgundo]


A web-based card game centered around the elements of the Periodic Table. Originally built with Svelte, the project has transitioned to a lightweight, high-performance architecture using an Express backend and an HTML5 Canvas-based frontend.

## Features

- **Element-Based Gameplay:** Cards represent chemical elements with unique properties and traits.
- **Canvas Rendering:** High-performance rendering engine using HTML5 Canvas for smooth card interactions.
- **RESTful API:** Express-powered backend providing element data and traits.
- **Lightweight Design:** Minimal dependencies for fast loading and easy deployment.

## Tech Stack

- **Backend:** [Express](https://expressjs.com/) (Node.js)
- **Frontend:** Vanilla JavaScript (ES Modules), HTML5 Canvas
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Backend)
- **Execution:** [tsx](https://github.com/privatenumber/tsx) for seamless TypeScript execution

## File Structure

```text
cardgame/
├── data/                  # JSON data for elements and traits
│   ├── elements.json
│   └── traits.json
├── public/                # Static assets and frontend logic
│   ├── app.js             # Main entry point for Canvas rendering
│   ├── utils.js           # Shared frontend utilities
│   └── process/           # Client-side logic for API and scoring
│       ├── api.js
│       └── score.js
├── src/
│   ├── index.ts           # Express server implementation
│   └── template/
│       └── index.html     # Main application template
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
