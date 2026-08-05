import { BattleEngine } from "../process/battleEngine.js";
import { hideLobby, showLobby } from "./lobby.js";
import { hpComputation } from "../utils.js";

let battleEngine = null;
let selectedPlayerElements = [];
let lastUsedDeckIds = [];

export function initBattleField(ctx, canvas, state) {
  battleEngine = new BattleEngine();

  const btnBattle = document.getElementById("btn-battle");
  const btnAttack = document.getElementById("btn-attack");
  const btnSkill = document.getElementById("btn-skill");
  const btnSwitch = document.getElementById("btn-switch");
  const btnRetreat = document.getElementById("btn-retreat");
  const btnCloseSwitch = document.getElementById("btn-close-switch");
  const btnBattleAgain = document.getElementById("btn-battle-again");
  const btnBattleExit = document.getElementById("btn-battle-exit");

  const btnAutoSelect = document.getElementById("btn-auto-select");
  const btnAutoPilotDeck = document.getElementById("btn-autopilot-deck");
  const btnStartBattle = document.getElementById("btn-start-battle");
  const btnCancelDeck = document.getElementById("btn-cancel-deck");

  const btnAutoPilot = document.getElementById("btn-autopilot");

  const deckSelectView = document.getElementById("deck-select-view");
  const battleView = document.getElementById("battle-view");
  const switchOverlay = document.getElementById("switch-modal-overlay");
  const resultOverlay = document.getElementById("battle-result-overlay");

  let autoReplayTimeout = null;

  const btnModeAi = document.getElementById("btn-mode-ai");
  const btnModeHuman = document.getElementById("btn-mode-human");
  const matchmakingOverlay = document.getElementById("matchmaking-overlay");
  const btnCancelMatchmaking = document.getElementById("btn-cancel-matchmaking");
  const btnFallbackAi = document.getElementById("btn-fallback-ai");

  let currentMode = "vs_ai";

  if (btnModeAi && btnModeHuman) {
    btnModeAi.addEventListener("click", () => {
      currentMode = "vs_ai";
      btnModeAi.classList.add("active");
      btnModeHuman.classList.remove("active");
    });

    btnModeHuman.addEventListener("click", () => {
      currentMode = "vs_human";
      btnModeHuman.classList.add("active");
      btnModeAi.classList.remove("active");
    });
  }

  // Battle Engine Event Hooks
  battleEngine.onLog = (msg) => {
    const logElem = document.getElementById("battle-log-msg");
    if (logElem) logElem.textContent = msg;
  };

  battleEngine.onStateChange = () => {
    updateHUD();
  };

  battleEngine.onSearching = (msg) => {
    if (matchmakingOverlay) {
      matchmakingOverlay.classList.remove("hidden");
      const statusTxt = document.getElementById("matchmaking-status-text");
      if (statusTxt) statusTxt.textContent = msg || "Searching for random human opponent...";
    }
  };

  battleEngine.onMatchFound = (data) => {
    if (matchmakingOverlay) matchmakingOverlay.classList.add("hidden");
    deckSelectView.classList.add("hidden");
    battleView.classList.remove("hidden");
    state.view = "battle";
    updateHUD();
  };

  if (btnCancelMatchmaking) {
    btnCancelMatchmaking.addEventListener("click", () => {
      battleEngine.cancelMatchmaking();
      if (matchmakingOverlay) matchmakingOverlay.classList.add("hidden");
    });
  }

  if (btnFallbackAi) {
    btnFallbackAi.addEventListener("click", () => {
      battleEngine.cancelMatchmaking();
      if (matchmakingOverlay) matchmakingOverlay.classList.add("hidden");
      currentMode = "vs_ai";
      if (btnModeAi) {
        btnModeAi.classList.add("active");
        if (btnModeHuman) btnModeHuman.classList.remove("active");
      }
      battleEngine.setMode("vs_ai");
      state.view = "battle";
      deckSelectView.classList.add("hidden");
      battleView.classList.remove("hidden");
      battleEngine.init(selectedPlayerElements, state.traits || {}, state.elements);
      updateHUD();
    });
  }

  // Open Deck Selection when clicking "Battle" in lobby
  btnBattle.addEventListener("click", () => {
    state.view = "deck_select";
    hideLobby();
    deckSelectView.classList.remove("hidden");
    battleView.classList.add("hidden");
    resultOverlay.classList.add("hidden");
    switchOverlay.classList.add("hidden");
    if (matchmakingOverlay) matchmakingOverlay.classList.add("hidden");

    selectedPlayerElements = [];
    renderDeckSelectionGrid(state.elements, state);
  });

  // Auto Select 3 cards from owned collection
  btnAutoSelect.addEventListener("click", () => {
    autoSelectDeck(state);
    renderDeckSelectionGrid(state.elements, state);
  });

  // Auto Pilot Deck & Start Battle directly
  if (btnAutoPilotDeck) {
    btnAutoPilotDeck.addEventListener("click", () => {
      if (selectedPlayerElements.length < 3) {
        autoSelectDeck(state);
        renderDeckSelectionGrid(state.elements, state);
      }
      if (selectedPlayerElements.length === 3) {
        lastUsedDeckIds = selectedPlayerElements.map((el) => el.id);
        battleEngine.setMode("vs_ai");
        state.view = "battle";
        deckSelectView.classList.add("hidden");
        battleView.classList.remove("hidden");

        battleEngine.init(selectedPlayerElements, state.traits || {}, state.elements);
        battleEngine.toggleAutoPilot(true);
        updateHUD();
      }
    });
  }

  // Start Battle with selected deck
  btnStartBattle.addEventListener("click", () => {
    if (selectedPlayerElements.length !== 3) return;

    lastUsedDeckIds = selectedPlayerElements.map((el) => el.id);
    battleEngine.setMode(currentMode);

    if (currentMode === "vs_human") {
      if (matchmakingOverlay) matchmakingOverlay.classList.remove("hidden");
      battleEngine.init(selectedPlayerElements, state.traits || {}, state.elements);
    } else {
      state.view = "battle";
      deckSelectView.classList.add("hidden");
      battleView.classList.remove("hidden");

      battleEngine.init(selectedPlayerElements, state.traits || {}, state.elements);
      updateHUD();
    }
  });

  // Auto Pilot Toggle Button in Battle Action Bar
  if (btnAutoPilot) {
    btnAutoPilot.addEventListener("click", () => {
      battleEngine.toggleAutoPilot();
      updateHUD();
    });
  }

  // Cancel Deck Selection -> return to lobby
  btnCancelDeck.addEventListener("click", () => {
    exitBattle(state);
  });

  btnAttack.addEventListener("click", () => {
    battleEngine.playerAttack();
  });

  btnSkill.addEventListener("click", () => {
    battleEngine.playerSkill();
  });

  btnSwitch.addEventListener("click", () => {
    openSwitchModal();
  });

  btnCloseSwitch.addEventListener("click", () => {
    switchOverlay.classList.add("hidden");
  });

  btnRetreat.addEventListener("click", () => {
    if (autoReplayTimeout) clearTimeout(autoReplayTimeout);
    exitBattle(state);
  });

  btnBattleAgain.addEventListener("click", () => {
    if (autoReplayTimeout) clearTimeout(autoReplayTimeout);
    resultOverlay.classList.add("hidden");
    switchOverlay.classList.add("hidden");

    // Clear previous deck selection so player must select another set of cards for next battle
    selectedPlayerElements = [];

    // If Auto Pilot was enabled, auto select a new set of cards and restart battle directly
    if (battleEngine && battleEngine.isAutoPilot) {
      autoSelectDeck(state);
      if (selectedPlayerElements.length === 3) {
        lastUsedDeckIds = selectedPlayerElements.map((el) => el.id);
        battleEngine.init(selectedPlayerElements, state.traits || {}, state.elements);
        battleEngine.toggleAutoPilot(true);
        updateHUD();
        return;
      }
    }

    state.view = "deck_select";
    battleView.classList.add("hidden");
    deckSelectView.classList.remove("hidden");
    renderDeckSelectionGrid(state.elements, state);
  });

  btnBattleExit.addEventListener("click", () => {
    if (autoReplayTimeout) clearTimeout(autoReplayTimeout);
    exitBattle(state);
  });

  // Canvas Click Handler for selecting bench cards directly
  canvas.addEventListener("click", (e) => {
    if (state.view !== "battle") return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    battleEngine.handleCanvasClick(mouseX, mouseY);
  });
}

function autoSelectDeck(state) {
  const userCards = (state && state.currentUser && Array.isArray(state.currentUser.cards))
    ? state.currentUser.cards
    : [];

  const ownedElements = state.elements.map(el => {
    const uCard = userCards.find(c => (typeof c === "string" ? c === el.id : c.id === el.id));
    if (uCard) {
      const lvl = typeof uCard === "object" && uCard.level ? uCard.level : 1;
      return { ...el, level: lvl };
    }
    return null;
  }).filter(Boolean);

  if (ownedElements.length < 3) return;

  // Separate owned cards into unused vs used in previous battle
  const unusedCards = ownedElements.filter((el) => !lastUsedDeckIds.includes(el.id));
  const usedCards = ownedElements.filter((el) => lastUsedDeckIds.includes(el.id));

  // Shuffle both sets independently
  const shuffledUnused = [...unusedCards].sort(() => 0.5 - Math.random());
  const shuffledUsed = [...usedCards].sort(() => 0.5 - Math.random());

  // Prioritize unused cards so player gets a different set of cards when available
  const combined = [...shuffledUnused, ...shuffledUsed];
  selectedPlayerElements = combined.slice(0, 3);
}

function renderDeckSelectionGrid(elements, state) {
  const grid = document.getElementById("deck-select-grid");
  const countText = document.getElementById("select-count-text");
  const btnStart = document.getElementById("btn-start-battle");
  grid.innerHTML = "";

  const userCards = (state && state.currentUser && Array.isArray(state.currentUser.cards))
    ? state.currentUser.cards
    : [
      { id: "H", level: 1 },
      { id: "He", level: 2 },
      { id: "Li", level: 3 },
      { id: "C", level: 4 },
      { id: "O", level: 5 },
      { id: "Fe", level: 3 }
    ];

  elements.forEach((el) => {
    const userCardObj = userCards.find((c) => (typeof c === "string" ? c === el.id : c.id === el.id));
    const isOwned = !!userCardObj;
    const isSelected = selectedPlayerElements.some((item) => item.id === el.id);

    const level = userCardObj && typeof userCardObj === "object" && userCardObj.level ? userCardObj.level : (el.level || 1);
    const calculatedHp = hpComputation(level, Number(el.hp));
    const maxDamage = Math.floor((Number(el.reactivity) * (Number(el.hp) / 10)) + (level * 5));

    const elWithLevel = { ...el, level: level };

    const cardOpt = document.createElement("div");
    cardOpt.className = `deck-card-option ${isSelected ? "selected" : ""} ${!isOwned ? "disabled unowned" : ""}`;
    cardOpt.innerHTML = `
      <div class="opt-id">${el.id}</div>
      <div class="opt-name">${el.name} <span style="color:#ffaa00; font-size:0.75rem;">Lv.${level}</span></div>
      <div class="opt-stats">HP ${calculatedHp} | ATK 1-${maxDamage}</div>
      <div class="opt-ownership">${isOwned ? "OWNED" : "🔒 LOCKED"}</div>
    `;

    if (isOwned) {
      cardOpt.addEventListener("click", () => {
        if (isSelected) {
          selectedPlayerElements = selectedPlayerElements.filter((item) => item.id !== el.id);
        } else {
          if (selectedPlayerElements.length < 3) {
            selectedPlayerElements.push(elWithLevel);
          }
        }
        renderDeckSelectionGrid(elements, state);
      });
    }

    grid.appendChild(cardOpt);
  });

  countText.textContent = `${selectedPlayerElements.length}/3`;
  btnStart.disabled = selectedPlayerElements.length !== 3;
}

function updateHUD() {
  if (!battleEngine) return;

  const turnBadge = document.getElementById("turn-badge");
  const autopilotBadge = document.getElementById("autopilot-badge");
  const btnAttack = document.getElementById("btn-attack");
  const btnSkill = document.getElementById("btn-skill");
  const btnSwitch = document.getElementById("btn-switch");
  const btnAutoPilot = document.getElementById("btn-autopilot");
  const resultOverlay = document.getElementById("battle-result-overlay");
  const switchOverlay = document.getElementById("switch-modal-overlay");

  const isPlayerTurn = battleEngine.turn === "player" && !battleEngine.isBusy;
  const isBattleActive = battleEngine.battleState === "active";
  const isAutoPilotActive = battleEngine.isAutoPilot;

  // Auto Pilot UI Status Updates
  if (btnAutoPilot) {
    if (isAutoPilotActive) {
      btnAutoPilot.classList.add("active");
      btnAutoPilot.innerHTML = `<span class="action-icon">🤖</span> AUTO PILOT: ON`;
    } else {
      btnAutoPilot.classList.remove("active");
      btnAutoPilot.innerHTML = `<span class="action-icon">🤖</span> AUTO PILOT: OFF`;
    }
  }

  if (autopilotBadge) {
    if (isAutoPilotActive && (isBattleActive || battleEngine.battleState === "selecting_replacement")) {
      autopilotBadge.classList.remove("hidden");
    } else {
      autopilotBadge.classList.add("hidden");
    }
  }

  // Turn Badge
  if (turnBadge) {
    if (battleEngine.turn === "player") {
      turnBadge.textContent = "YOUR TURN";
      turnBadge.classList.remove("bot-turn");
    } else {
      turnBadge.textContent = "BOT TURN";
      turnBadge.classList.add("bot-turn");
    }
  }

  // Buttons state
  btnAttack.disabled = !isPlayerTurn || !isBattleActive;
  btnSkill.disabled = !isPlayerTurn || !isBattleActive;
  btnSwitch.disabled = !isPlayerTurn && battleEngine.battleState !== "selecting_replacement";

  // Close switch overlay if battle is active and not selecting replacement
  if (battleEngine.battleState === "active") {
    switchOverlay.classList.add("hidden");
  }

  // Prompt replacement if forced
  if (battleEngine.battleState === "selecting_replacement") {
    openSwitchModal();
  }

  // Victory / Defeat Overlay
  if (battleEngine.battleState === "victory" || battleEngine.battleState === "defeat") {
    resultOverlay.classList.remove("hidden");
    switchOverlay.classList.add("hidden");
    const resultTitle = document.getElementById("result-title");
    const resultMsg = document.getElementById("result-message");

    if (battleEngine.battleState === "victory") {
      resultTitle.textContent = "VICTORY";
      resultTitle.style.color = "#00f2ff";
      resultMsg.textContent = "You defeated all enemy elemental cards!";
    } else {
      resultTitle.textContent = "DEFEAT";
      resultTitle.style.color = "#ff3300";
      resultMsg.textContent = "All your cards were defeated in battle.";
    }

    // Auto Replay if Auto Pilot is active
    let autoReplayBadge = document.getElementById("auto-replay-badge");
    if (isAutoPilotActive) {
      if (!autoReplayBadge) {
        autoReplayBadge = document.createElement("div");
        autoReplayBadge.id = "auto-replay-badge";
        autoReplayBadge.className = "auto-replay-badge";
        const resultPanel = resultOverlay.querySelector(".result-panel");
        if (resultPanel) resultPanel.appendChild(autoReplayBadge);
      }
      autoReplayBadge.textContent = "🤖 AUTOPILOT: NEXT BATTLE IN 3 SECONDS...";
      autoReplayBadge.classList.remove("hidden");

      const btnBattleAgain = document.getElementById("btn-battle-again");
      if (btnBattleAgain && !btnBattleAgain.dataset.autoCounting) {
        btnBattleAgain.dataset.autoCounting = "true";
        setTimeout(() => {
          delete btnBattleAgain.dataset.autoCounting;
          if (battleEngine && battleEngine.isAutoPilot && (battleEngine.battleState === "victory" || battleEngine.battleState === "defeat")) {
            btnBattleAgain.click();
          }
        }, 3000);
      }
    } else if (autoReplayBadge) {
      autoReplayBadge.classList.add("hidden");
    }
  }
}

function openSwitchModal() {
  if (!battleEngine) return;
  const switchOverlay = document.getElementById("switch-modal-overlay");
  const container = document.getElementById("switch-cards-container");
  container.innerHTML = "";

  const isSelectingReplacement = battleEngine.battleState === "selecting_replacement";

  battleEngine.playerDeck.forEach((card, idx) => {
    const isCurrentActive = idx === battleEngine.playerActiveIndex && card.status === "active";
    const isDefeated = card.status === "defeated" || card.currentHp <= 0;

    const item = document.createElement("div");
    item.className = `switch-card-item ${isDefeated || isCurrentActive ? "disabled" : ""}`;
    item.innerHTML = `
      <div class="item-name">${card.element.name} (${card.element.id})</div>
      <div class="item-hp">HP: ${card.currentHp}/${card.maxHp}</div>
      <div class="item-status">${isCurrentActive ? "[ ACTIVE ]" : isDefeated ? "[ DEFEATED ]" : "[ SELECT ]"}</div>
    `;

    if (!isDefeated && !isCurrentActive) {
      item.addEventListener("click", () => {
        battleEngine.playerSwitchCard(idx);
        switchOverlay.classList.add("hidden");
      });
    }

    container.appendChild(item);
  });

  const btnCloseSwitch = document.getElementById("btn-close-switch");
  if (btnCloseSwitch) {
    btnCloseSwitch.style.display = isSelectingReplacement ? "none" : "inline-block";
  }

  switchOverlay.classList.remove("hidden");
}

function exitBattle(state) {
  state.view = "lobby";
  selectedPlayerElements = [];
  document.getElementById("deck-select-view").classList.add("hidden");
  document.getElementById("battle-view").classList.add("hidden");
  document.getElementById("battle-result-overlay").classList.add("hidden");
  document.getElementById("switch-modal-overlay").classList.add("hidden");
  showLobby(state.currentUser || { username: "Guest" });
}

export function renderBattle(ctx, canvas, state) {
  if (battleEngine && state.view === "battle") {
    battleEngine.render(ctx, canvas, state.time);
  }
}
