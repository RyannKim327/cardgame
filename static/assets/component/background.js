import card from "./../widgets/card.js";
import { renderBattle } from "../ui/battle.js";

let bgIndices = [];
let lastBgChangeTime = 0;

let lobbyScrollY = 0;

export function scrollLobby(deltaY) {
  lobbyScrollY += deltaY;
}

export function resetLobbyScroll() {
  lobbyScrollY = 0;
}

export function gameBackground(ctx, canvas, state) {
  // Clear Background
  ctx.fillStyle = "#050a14" // Deep dark navy
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw grid background for sci-fi feel
  drawGrid();

  // Update floating background card indices every 2.5 seconds (for Auth background only)
  if (state.elements.length > 0) {
    if (bgIndices.length === 0 || state.time - lastBgChangeTime >= 2.5) {
      lastBgChangeTime = state.time;
      const total = state.elements.length;

      // Pick 5 random background cards for auth view
      bgIndices = [];
      for (let i = 0; i < 5; i++) {
        bgIndices.push(Math.floor(Math.random() * total));
      }
    }
  }

  if (state.view === 'battle') {
    renderBattle(ctx, canvas, state);
  } else if (state.elements.length > 0) {
    // Different rendering based on view
    if (state.view === 'auth') {
      // Background effect: just a few cards floating
      drawBackgroundCards();
    } else if (state.view === 'lobby') {
      // Lobby: Show the user's actual owned card collection (stable & scrollable on canvas)
      drawLobbyCards();
    }
  }


  function drawGrid() {
    ctx.strokeStyle = "rgba(0, 242, 255, 0.05)";
    ctx.lineWidth = 1;
    const step = 50;

    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawBackgroundCards() {
    // Show floating cards drifting as ambient background in auth view
    bgIndices.forEach((idx, i) => {
      const element = state.elements[idx];
      if (element) {
        const w = 150;
        const h = w * 1.5;
        const x = 100 + i * 220 + Math.sin(state.time + i) * 20;
        const y = 180 + Math.cos(state.time * 0.5 + i) * 30;

        card(ctx, { w, h, x, y, element, time: state.time }, true);
      }
    });
  }

  function drawLobbyCards() {
    let userOwnedElements = [];
    if (state.currentUser && Array.isArray(state.currentUser.cards)) {
      userOwnedElements = state.elements.map(el => {
        const uCard = state.currentUser.cards.find(c => (typeof c === "string" ? c === el.id : c.id === el.id));
        if (uCard) {
          const level = typeof uCard === "object" && uCard.level ? uCard.level : 1;
          return { ...el, level: level };
        }
        return null;
      }).filter(Boolean);
    }

    if (userOwnedElements.length === 0) {
      userOwnedElements = state.elements.slice(0, 18);
    }

    const grids = canvas.width > 1000 ? 8 : 4;
    const w = canvas.width / (grids * 1.3);
    const xgaps = 30;
    const ygaps = 30;
    const h = (w * 1.5);

    // Calculate max scroll bounds
    const totalRows = Math.ceil(userOwnedElements.length / grids);
    const totalHeight = 120 + totalRows * (h + ygaps);
    const maxScroll = Math.max(0, totalHeight - canvas.height + 60);

    lobbyScrollY = Math.max(0, Math.min(lobbyScrollY, maxScroll));

    userOwnedElements.forEach((element, i) => {
      const row = Math.floor(i / grids);
      const cardY = 120 + row * (h + ygaps) - lobbyScrollY;

      // Render only if within visible canvas bounds
      if (cardY + h >= 60 && cardY <= canvas.height) {
        card(ctx, {
          w: w,
          h: h,
          x: 50 + (i % grids) * (w + xgaps),
          y: cardY,
          element,
          time: state.time
        });
      }
    });
  }
}

