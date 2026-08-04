import { hpComputation } from "../utils.js";
import card from "../widgets/card.js";
import { damagePoints } from "./score.js";

// Battle Manager Instance
export class BattleEngine {
  constructor() {
    this.elements = [];
    this.traits = {};
    this.playerDeck = [];
    this.botDeck = [];
    this.playerActiveIndex = 0;
    this.botActiveIndex = 0;
    this.turn = "player"; // "player" | "bot"
    this.isBusy = false;
    this.battleState = "idle"; // "idle" | "active" | "selecting_replacement" | "victory" | "defeat"

    // Slanted Battling Card Positions (Opponent near top-right stack, Player near bottom-left stack)
    this.playerActiveRel = { x: 0.28, y: 0.58 };
    this.botActiveRel = { x: 0.72, y: 0.28 };

    // Auto Pilot State
    this.isAutoPilot = false;
    this.autoPilotTimer = null;

    // Visual Effects
    this.floatingTexts = [];
    this.projectiles = [];
    this.dissolveParticles = [];
    this.logMessages = [];

    // UI Callback hooks
    this.onStateChange = null;
    this.onLog = null;
  }

  init(playerSelectedElements, traits, allElements = []) {
    this.elements = allElements.length > 0 ? allElements : (this.elements.length > 0 ? this.elements : playerSelectedElements || []);
    this.traits = traits || {};

    // Use player selected cards if provided, otherwise pick 3 random
    let pCards = (playerSelectedElements && playerSelectedElements.length === 3) ? playerSelectedElements : [];
    if (pCards.length === 0 && this.elements.length > 0) {
      const shuffled = [...this.elements].sort(() => 0.5 - Math.random());
      pCards = shuffled.slice(0, 3);
    }

    // Pick 3 cards for Bot AI
    const availableForBot = this.elements.length > 0 ? this.elements : pCards;
    const botShuffled = [...availableForBot].sort(() => 0.5 - Math.random());
    const bCards = botShuffled.slice(0, 3);

    // Build Player Deck with HP Formula: originalHp + (level * 5)
    this.playerDeck = pCards.map((el, idx) => {
      const level = el.level || (idx + 1);
      const originalHp = Number(el.hp) || 4;
      const maxHp = hpComputation(level, originalHp);

      return {
        instanceId: `player_${idx}`,
        element: el,
        level: level,
        originalHp: originalHp,
        maxHp: maxHp,
        currentHp: maxHp,
        attackCount: 0,
        status: idx === 0 ? "active" : "bench",
        dissolveProgress: 0,
        isDissolving: false,
        shake: 0
      };
    });

    // Build Bot Deck with randomized levels between 1 and 10
    this.botDeck = bCards.map((el, idx) => {
      const level = Math.floor(Math.random() * 10) + 1;
      const originalHp = Number(el.hp) || 4;
      const maxHp = hpComputation(level, originalHp);
      const botElement = { ...el, level: level };

      return {
        instanceId: `bot_${idx}`,
        element: botElement,
        level: level,
        originalHp: originalHp,
        maxHp: maxHp,
        currentHp: maxHp,
        attackCount: 0,
        status: idx === 0 ? "active" : "bench",
        dissolveProgress: 0,
        isDissolving: false,
        shake: 0
      };
    });

    this.playerActiveIndex = 0;
    this.botActiveIndex = 0;
    this.turn = "player";
    this.isBusy = false;
    this.battleState = "active";
    this.floatingTexts = [];
    this.projectiles = [];
    this.dissolveParticles = [];
    this.logMessages = [];

    this.addLog("BATTLE INITIALIZED: Player vs Bot AI!");
    this.addLog(`Player active: ${this.getPlayerActive().element.name} (Lv.${this.getPlayerActive().level})`);
    this.addLog(`Bot active: ${this.getBotActive().element.name} (Lv.${this.getBotActive().level})`);

    if (this.isAutoPilot) {
      this.addLog("🤖 AUTOPILOT: Active and preparing initial turn...");
      this.scheduleAutoPilotAction(1000);
    }

    if (this.onStateChange) this.onStateChange();
  }

  getPlayerActive() {
    return this.playerDeck[this.playerActiveIndex];
  }

  getBotActive() {
    return this.botDeck[this.botActiveIndex];
  }

  addLog(msg) {
    this.logMessages.unshift(msg);
    if (this.logMessages.length > 5) this.logMessages.pop();
    if (this.onLog) this.onLog(msg);
  }

  // --- AUTOPILOT ENGINE ---

  toggleAutoPilot(enabled = null) {
    this.isAutoPilot = enabled !== null ? enabled : !this.isAutoPilot;
    if (this.isAutoPilot) {
      this.addLog("🤖 AUTOPILOT: ENGAGED - Tactical AI active!");
      if (this.turn === "player" || this.battleState === "selecting_replacement") {
        this.scheduleAutoPilotAction(600);
      }
    } else {
      if (this.autoPilotTimer) {
        clearTimeout(this.autoPilotTimer);
        this.autoPilotTimer = null;
      }
      this.addLog("🤖 AUTOPILOT: DISENGAGED - Manual control active.");
    }

    if (this.onStateChange) this.onStateChange();
    return this.isAutoPilot;
  }

  scheduleAutoPilotAction(delay = 800) {
    if (this.autoPilotTimer) {
      clearTimeout(this.autoPilotTimer);
      this.autoPilotTimer = null;
    }

    if (!this.isAutoPilot) return;
    if (this.battleState !== "active" && this.battleState !== "selecting_replacement") return;

    this.autoPilotTimer = setTimeout(() => {
      this.executeAutoPilotAction();
    }, delay);
  }

  executeAutoPilotAction() {
    if (!this.isAutoPilot) return;

    // Case 1: Selecting replacement after card fainted
    if (this.battleState === "selecting_replacement") {
      let bestIndex = -1;
      let bestScore = -1;
      const defender = this.getBotActive();

      this.playerDeck.forEach((cardObj, idx) => {
        if (idx !== this.playerActiveIndex && cardObj.currentHp > 0) {
          const hpRatio = cardObj.currentHp / cardObj.maxHp;
          let score = hpRatio * 10;

          if (defender && cardObj.element.traits && defender.element.traits) {
            cardObj.element.traits.forEach(t => {
              const traitInfo = this.traits[t];
              if (traitInfo && traitInfo.strong_against) {
                defender.element.traits.forEach(dt => {
                  if (traitInfo.strong_against.includes(dt)) score += 5;
                });
              }
            });
          }

          if (score > bestScore) {
            bestScore = score;
            bestIndex = idx;
          }
        }
      });

      if (bestIndex !== -1) {
        this.addLog(`🤖 AUTOPILOT: Automatically selected replacement card!`);
        this.playerSwitchCard(bestIndex);
      }
      return;
    }

    // Case 2: Normal turn decision
    if (this.turn !== "player" || this.isBusy || this.battleState !== "active") {
      if (this.isAutoPilot && (this.turn === "player" || this.battleState === "selecting_replacement")) {
        this.scheduleAutoPilotAction(400);
      }
      return;
    }

    const attacker = this.getPlayerActive();
    const defender = this.getBotActive();
    if (!attacker || !defender) return;

    const hpRatio = attacker.currentHp / attacker.maxHp;

    // Low HP tactical switch check
    if (hpRatio < 0.25) {
      let healthyBenchIdx = -1;
      this.playerDeck.forEach((c, idx) => {
        if (idx !== this.playerActiveIndex && c.currentHp / c.maxHp > 0.55) {
          healthyBenchIdx = idx;
        }
      });

      if (healthyBenchIdx !== -1 && Math.random() < 0.7) {
        this.addLog(`🤖 AUTOPILOT: Low HP on ${attacker.element.name}! Tactical bench switch.`);
        this.playerSwitchCard(healthyBenchIdx);
        return;
      }
    }

    // Skill Burst Check (attackCount % 3 === 2)
    const isBurstReady = (attacker.attackCount % 3 === 2);
    if (isBurstReady || Math.random() < 0.35) {
      this.playerSkill();
    } else {
      this.playerAttack();
    }
  }

  // --- PLAYER ACTIONS ---

  playerAttack() {
    if (this.turn !== "player" || this.isBusy || this.battleState !== "active") return;

    if (this.autoPilotTimer) {
      clearTimeout(this.autoPilotTimer);
      this.autoPilotTimer = null;
    }

    this.isBusy = true;
    const attacker = this.getPlayerActive();
    const defender = this.getBotActive();

    this.addLog(`Player's ${attacker.element.name} attacks!`);

    this.projectiles.push({
      startX: this.playerActiveRel.x, startY: this.playerActiveRel.y,
      targetX: this.botActiveRel.x, targetY: this.botActiveRel.y,
      x: this.playerActiveRel.x, y: this.playerActiveRel.y,
      progress: 0,
      color: "#00f2ff",
      onComplete: () => {
        const result = damagePoints({
          attacker: attacker.element,
          defender: defender.element,
          traits: this.traits,
          attackerLevel: attacker.level || 1
        });

        const damage = Math.max(1, result.finalDamage);
        defender.currentHp = Math.max(0, defender.currentHp - damage);
        defender.shake = result.is3rdAttack ? 25 : 15;

        let txt = `-${damage}`;
        let textColor = "#00f2ff";

        if (result.is3rdAttack && result.isWeak) {
          txt = `⚡ CRIT (WEAK) -${damage}`;
          textColor = "#ffaa00";
        } else if (result.is3rdAttack) {
          txt = `⚡ CRITICAL HIT -${damage}`;
          textColor = "#ff00ff";
        } else if (result.isWeak) {
          txt = `🛡️ WEAK -${damage}`;
          textColor = "#88aaff";
        } else if (result.isStrong) {
          txt = `💥 STRONG -${damage}`;
          textColor = "#ffaa00";
        }

        this.addFloatingText(this.botActiveRel.x, this.botActiveRel.y, txt, textColor);

        if (result.is3rdAttack && result.isWeak) {
          this.addLog(`⚡ CRITICAL TRAIT BURST! (WEAK AGAINST target: ${damage} damage)`);
        } else if (result.is3rdAttack) {
          this.addLog(`⚡ RANDOM TRAIT CRITICAL BURST! Dealt ${damage} CRITICAL damage to Bot's ${defender.element.name}!`);
        } else if (result.isWeak) {
          this.addLog(`🛡️ WEAK AGAINST! Dealt reduced ${damage} damage to Bot's ${defender.element.name}.`);
        } else {
          this.addLog(`Dealt ${damage} damage to Bot's ${defender.element.name}!`);
        }

        if (defender.currentHp <= 0) {
          this.triggerDissolve(defender, "bot");
        } else {
          setTimeout(() => {
            this.startBotTurn();
          }, 800);
        }
      }
    });
  }

  playerSkill() {
    if (this.turn !== "player" || this.isBusy || this.battleState !== "active") return;

    if (this.autoPilotTimer) {
      clearTimeout(this.autoPilotTimer);
      this.autoPilotTimer = null;
    }

    this.isBusy = true;
    const attacker = this.getPlayerActive();
    const defender = this.getBotActive();

    attacker.attackCount = (attacker.attackCount || 0) + 1;
    const is3rd = (attacker.attackCount % 3 === 0);

    const traitName = attacker.element.traits[0] || "elemental";
    this.addLog(`Player's ${attacker.element.name} activates ${traitName.toUpperCase()} SKILL!`);

    this.projectiles.push({
      startX: this.playerActiveRel.x, startY: this.playerActiveRel.y,
      targetX: this.botActiveRel.x, targetY: this.botActiveRel.y,
      x: this.playerActiveRel.x, y: this.playerActiveRel.y,
      progress: 0,
      color: "#ff00ff",
      skill: true,
      onComplete: () => {
        const result = damagePoints({
          attacker: attacker.element,
          defender: defender.element,
          traits: this.traits,
          attackerLevel: attacker.level || 1,
          attackCount: attacker.attackCount
        });

        const damage = Math.max(1, Math.floor(result.finalDamage * 1.2));
        defender.currentHp = Math.max(0, defender.currentHp - damage);
        defender.shake = 25;

        this.addFloatingText(this.botActiveRel.x, this.botActiveRel.y, `CRITICAL -${damage}`, "#ff00ff");
        this.addLog(`Skill hit for ${damage} damage!`);

        if (defender.currentHp <= 0) {
          this.triggerDissolve(defender, "bot");
        } else {
          setTimeout(() => {
            this.startBotTurn();
          }, 800);
        }
      }
    });
  }

  playerSwitchCard(targetIndex) {
    // Allow switch if it's player's turn OR if we are waiting for replacement selection
    if (this.battleState !== "selecting_replacement" && (this.turn !== "player" || this.isBusy)) return;

    if (this.autoPilotTimer) {
      clearTimeout(this.autoPilotTimer);
      this.autoPilotTimer = null;
    }

    const targetCard = this.playerDeck[targetIndex];
    if (!targetCard || targetCard.currentHp <= 0 || targetIndex === this.playerActiveIndex) {
      return;
    }

    if (this.battleState === "selecting_replacement") {
      // Free switch after active card defeat
      if (this.getPlayerActive()) {
        this.getPlayerActive().status = "bench";
      }
      this.playerActiveIndex = targetIndex;
      targetCard.status = "active";
      this.battleState = "active";
      this.turn = "player";
      this.isBusy = false;
      this.addLog(`Player sent out ${targetCard.element.name}!`);

      if (this.isAutoPilot) {
        this.scheduleAutoPilotAction(800);
      }
    } else if (this.battleState === "active") {
      this.isBusy = true;
      // Tactical mid-battle switch (uses turn)
      this.getPlayerActive().status = "bench";
      this.playerActiveIndex = targetIndex;
      targetCard.status = "active";
      this.addLog(`Player switched active card to ${targetCard.element.name}!`);

      setTimeout(() => {
        this.startBotTurn();
      }, 600);
    }

    if (this.onStateChange) this.onStateChange();
  }

  // --- BOT AI ---

  startBotTurn() {
    if (this.battleState !== "active") return;
    this.turn = "bot";
    this.isBusy = true;
    this.addLog("Bot AI is planning turn...");

    setTimeout(() => {
      if (this.battleState !== "active") return;

      const botActive = this.getBotActive();
      const playerActive = this.getPlayerActive();

      // Check if Bot should switch low HP card
      const healthyBotBenchIndex = this.botDeck.findIndex(
        (c, idx) => idx !== this.botActiveIndex && c.currentHp / c.maxHp > 0.5
      );

      if (botActive.currentHp / botActive.maxHp < 0.25 && healthyBotBenchIndex !== -1 && Math.random() < 0.5) {
        // Bot Switches Card
        botActive.status = "bench";
        this.botActiveIndex = healthyBotBenchIndex;
        const newBotCard = this.getBotActive();
        newBotCard.status = "active";
        this.addLog(`Bot AI switched card to ${newBotCard.element.name}!`);

        setTimeout(() => {
          this.turn = "player";
          this.isBusy = false;
          if (this.isAutoPilot) this.scheduleAutoPilotAction(800);
          if (this.onStateChange) this.onStateChange();
        }, 800);
      } else {
        // Bot Attacks
        this.addLog(`Bot's ${botActive.element.name} attacks!`);

        this.projectiles.push({
          startX: this.botActiveRel.x, startY: this.botActiveRel.y,
          targetX: this.playerActiveRel.x, targetY: this.playerActiveRel.y,
          x: this.botActiveRel.x, y: this.botActiveRel.y,
          progress: 0,
          color: "#ff3300",
          onComplete: () => {
            const result = damagePoints({
              attacker: botActive.element,
              defender: playerActive.element,
              traits: this.traits,
              attackerLevel: botActive.level || 1
            });

            const damage = Math.max(1, result.finalDamage);
            playerActive.currentHp = Math.max(0, playerActive.currentHp - damage);
            playerActive.shake = result.is3rdAttack ? 25 : 15;

            let txt = `-${damage}`;
            let textColor = "#ff3300";

            if (result.is3rdAttack && result.isWeak) {
              txt = `⚡ CRIT (WEAK) -${damage}`;
              textColor = "#ffaa00";
            } else if (result.is3rdAttack) {
              txt = `⚡ CRITICAL HIT -${damage}`;
              textColor = "#ff00ff";
            } else if (result.isWeak) {
              txt = `🛡️ WEAK -${damage}`;
              textColor = "#88aaff";
            }

            this.addFloatingText(this.playerActiveRel.x, this.playerActiveRel.y, txt, textColor);

            if (result.is3rdAttack && result.isWeak) {
              this.addLog(`⚡ BOT CRITICAL BURST! (WEAK AGAINST target: ${damage} damage)`);
            } else if (result.is3rdAttack) {
              this.addLog(`⚡ BOT CRITICAL BURST! Dealt ${damage} CRITICAL damage to your ${playerActive.element.name}!`);
            } else if (result.isWeak) {
              this.addLog(`🛡️ BOT WEAK AGAINST! Dealt reduced ${damage} damage to your ${playerActive.element.name}.`);
            } else {
              this.addLog(`Bot dealt ${damage} damage to your ${playerActive.element.name}!`);
            }

            if (playerActive.currentHp <= 0) {
              this.triggerDissolve(playerActive, "player");
            } else {
              this.turn = "player";
              this.isBusy = false;
              if (this.isAutoPilot) this.scheduleAutoPilotAction(800);
              if (this.onStateChange) this.onStateChange();
            }
          }
        });
      }
    }, 1000);
  }

  // --- DISSOLVE & DEFEAT HANDLING ---

  triggerDissolve(cardObj, owner) {
    cardObj.isDissolving = true;
    cardObj.dissolveProgress = 0.01;
    this.addLog(`${owner === "player" ? "Your" : "Bot's"} ${cardObj.element.name} was defeated! Dissolving...`);

    // Dissolve animation duration handled in tick loop (~1.2 sec)
    const interval = setInterval(() => {
      cardObj.dissolveProgress += 0.04;
      if (cardObj.dissolveProgress >= 1) {
        clearInterval(interval);
        cardObj.dissolveProgress = 1;
        cardObj.isDissolving = false;
        cardObj.status = "defeated";

        this.handleCardDefeated(owner);
      }
    }, 40);
  }

  handleCardDefeated(owner) {
    if (owner === "bot") {
      // Find next bot card
      const nextBotIndex = this.botDeck.findIndex((c) => c.currentHp > 0);
      if (nextBotIndex !== -1) {
        this.botActiveIndex = nextBotIndex;
        this.botDeck[nextBotIndex].status = "active";
        this.addLog(`Bot sent out ${this.getBotActive().element.name}!`);
        this.turn = "player";
        this.isBusy = false;
        if (this.isAutoPilot) this.scheduleAutoPilotAction(800);
      } else {
        this.battleState = "victory";
        this.addLog("VICTORY! All enemy cards eliminated!");
      }
    } else {
      // Player card defeated
      const nextPlayerIndex = this.playerDeck.findIndex((c) => c.currentHp > 0);
      if (nextPlayerIndex !== -1) {
        this.battleState = "selecting_replacement";
        this.turn = "player";
        this.isBusy = false;
        this.addLog("Choose a replacement card from your bench!");
        if (this.isAutoPilot) this.scheduleAutoPilotAction(600);
      } else {
        this.battleState = "defeat";
        this.addLog("DEFEAT! All your cards were destroyed!");
      }
    }

    if (this.onStateChange) this.onStateChange();
  }

  addFloatingText(relX, relY, text, color) {
    this.floatingTexts.push({
      relX, relY,
      text, color,
      alpha: 1.0,
      life: 1.0,
      offsetY: 0
    });
  }

  // --- TICK & CANVAS DRAW ---

  tick(dt) {
    // Projectiles
    this.projectiles.forEach((p) => {
      p.progress += dt * 2.5;
      p.x = p.startX + (p.targetX - p.startX) * p.progress;
      p.y = p.startY + (p.targetY - p.startY) * p.progress;

      if (p.progress >= 1 && !p.done) {
        p.done = true;
        p.onComplete();
      }
    });
    this.projectiles = this.projectiles.filter((p) => p.progress < 1);

    // Floating text decay
    this.floatingTexts.forEach((ft) => {
      ft.life -= dt * 1.2;
      ft.alpha = Math.max(0, ft.life);
      ft.offsetY -= dt * 40;
    });
    this.floatingTexts = this.floatingTexts.filter((ft) => ft.life > 0);

    // Card shakes decay
    [...this.playerDeck, ...this.botDeck].forEach((c) => {
      if (c.shake > 0) c.shake = Math.max(0, c.shake - dt * 50);
    });
  }

  render(ctx, canvas, time) {
    this.tick(0.016);

    const w = canvas.width;
    const h = canvas.height;

    // Arena Dividers & Energy Field
    this.drawArena(ctx, w, h, time);

    // Active Cards dimensions
    const cardW = Math.min(160, w * 0.18);
    const cardH = cardW * 1.4;

    // Bot Active Card Slot (Top-Right battlefield near opponent stack cards)
    const botActive = this.getBotActive();
    if (botActive && botActive.status !== "defeated") {
      const bxCenter = w * this.botActiveRel.x;
      const byCenter = h * this.botActiveRel.y;
      const bx = bxCenter - cardW * 0.5 + (Math.random() - 0.5) * botActive.shake;
      const by = byCenter - cardH * 0.5;

      this.drawSlotPedestal(ctx, bxCenter, byCenter + cardH * 0.5 + 8, cardW * 0.7, "#ff3300", time);

      card(ctx, {
        x: bx, y: by, w: cardW, h: cardH,
        element: botActive.element,
        time: time,
        currentHp: botActive.currentHp,
        maxHp: botActive.maxHp,
        dissolveProgress: botActive.dissolveProgress
      });

      // Health Bar
      this.drawHealthBar(ctx, bx, by - 28, cardW, botActive.currentHp, botActive.maxHp, "BOT ACTIVE", botActive.level, botActive.attackCount);
    }

    // Player Active Card Slot (Bottom-Left battlefield near player stack cards)
    const playerActive = this.getPlayerActive();
    if (playerActive && playerActive.status !== "defeated") {
      const pxCenter = w * this.playerActiveRel.x;
      const pyCenter = h * this.playerActiveRel.y;
      const px = pxCenter - cardW * 0.5 + (Math.random() - 0.5) * playerActive.shake;
      const py = pyCenter - cardH * 0.5;

      this.drawSlotPedestal(ctx, pxCenter, pyCenter + cardH * 0.5 + 8, cardW * 0.7, "#00f2ff", time);

      card(ctx, {
        x: px, y: py, w: cardW, h: cardH,
        element: playerActive.element,
        time: time,
        currentHp: playerActive.currentHp,
        maxHp: playerActive.maxHp,
        dissolveProgress: playerActive.dissolveProgress
      });

      // Health Bar
      this.drawHealthBar(ctx, px, py + cardH + 10, cardW, playerActive.currentHp, playerActive.maxHp, "PLAYER ACTIVE", playerActive.level, playerActive.attackCount);
    }

    // Render Bench Cards
    this.renderPlayerBench(ctx, w, h, time);
    this.renderBotBench(ctx, w, h, time);

    // Projectile Animations
    this.projectiles.forEach((p) => {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.skill ? 12 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Floating Text
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ft.color;
      ctx.fillText(ft.text, ft.relX * w, ft.relY * h + ft.offsetY);
      ctx.restore();
    });
  }

  drawArena(ctx, w, h, time) {
    // Battle Arena Mid-Field Slanted Line
    ctx.save();
    ctx.strokeStyle = "rgba(0, 242, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(w * 0.08, h * 0.32);
    ctx.lineTo(w * 0.92, h * 0.54);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing Clash Center Emblem (at mid-point between slanted card positions)
    const midX = w * ((this.playerActiveRel.x + this.botActiveRel.x) / 2);
    const midY = h * ((this.playerActiveRel.y + this.botActiveRel.y) / 2);
    ctx.strokeStyle = "rgba(0, 242, 255, 0.5)";
    ctx.shadowBlur = 10 + Math.sin(time * 3) * 5;
    ctx.shadowColor = "#00f2ff";
    ctx.beginPath();
    ctx.arc(midX, midY, 35 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
    ctx.stroke();

    // Slanted clash trajectory axis
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(w * this.playerActiveRel.x, h * this.playerActiveRel.y);
    ctx.lineTo(w * this.botActiveRel.x, h * this.botActiveRel.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  drawSlotPedestal(ctx, cx, cy, radius, color, time) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawHealthBar(ctx, x, y, width, currentHp, maxHp, label, level = 1, attackCount = 0) {
    ctx.save();
    const ratio = Math.max(0, currentHp / maxHp);
    const burstCount = attackCount % 3;
    const burstText = burstCount === 2 ? "⚡BURST READY" : `[Atk ${burstCount}/3]`;

    // HP Label (Above health bar)
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(`${label} Lv.${level}: ${currentHp}/${maxHp}`, x, y - 4);

    // Track
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, width, 8, 4);
    ctx.fill();
    ctx.stroke();

    // Fill
    let barColor = ratio > 0.5 ? "#00ff88" : ratio > 0.25 ? "#ffaa00" : "#ff3333";
    ctx.fillStyle = barColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = barColor;
    ctx.beginPath();
    ctx.roundRect(x, y, width * ratio, 8, 4);
    ctx.fill();

    // Colored Attack / Burst Text (Under health bar)
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = burstCount === 2 ? "#ff00ff" : "#00f2ff";
    ctx.shadowBlur = burstCount === 2 ? 6 : 0;
    ctx.shadowColor = burstCount === 2 ? "#ff00ff" : "transparent";
    ctx.fillText(burstText, x + width, y + 19);

    ctx.restore();
  }

  renderPlayerBench(ctx, w, h, time) {
    const benchW = 75;
    const benchH = benchW * 1.4;
    const startX = 30;
    const startY = h - benchH - 20;

    ctx.save();
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#00f2ff";
    ctx.fillText("RESERVE BENCH (CLICK TO SWITCH):", startX, startY - 10);

    this.playerDeck.forEach((c, idx) => {
      const bx = startX + idx * (benchW + 15);
      const isCurrentActive = idx === this.playerActiveIndex;
      const isDefeated = c.status === "defeated" || c.currentHp <= 0;

      // Click boundary metadata for event handling
      c.benchBounds = { x: bx, y: startY, w: benchW, h: benchH };

      ctx.save();
      if (isCurrentActive) {
        ctx.strokeStyle = "#00f2ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(bx - 3, startY - 3, benchW + 6, benchH + 6);
      }

      if (isDefeated) {
        ctx.globalAlpha = 0.3;
      }

      card(ctx, {
        x: bx, y: startY, w: benchW, h: benchH,
        element: c.element,
        time: time,
        currentHp: c.currentHp,
        maxHp: c.maxHp,
        dissolveProgress: c.dissolveProgress
      });

      if (isDefeated) {
        ctx.fillStyle = "#ff3333";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("DEFEATED", bx + benchW / 2, startY + benchH / 2);
      }
      ctx.restore();
    });
    ctx.restore();
  }

  renderBotBench(ctx, w, h, time) {
    const benchW = 60;
    const benchH = benchW * 1.4;
    const startX = w - 30 - 3 * (benchW + 10);
    const startY = 25;

    ctx.save();
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#ffaa00";
    ctx.fillText("BOT BENCH (HIDDEN):", startX, startY - 6);

    this.botDeck.forEach((c, idx) => {
      const bx = startX + idx * (benchW + 10);
      const isDefeated = c.status === "defeated" || c.currentHp <= 0;

      ctx.save();
      if (isDefeated) ctx.globalAlpha = 0.3;

      card(ctx, {
        x: bx, y: startY, w: benchW, h: benchH,
        element: c.element,
        time: time,
        currentHp: c.currentHp,
        maxHp: c.maxHp,
        dissolveProgress: c.dissolveProgress,
        facedown: !isDefeated && c.status !== "active"
      });
      ctx.restore();
    });
    ctx.restore();
  }

  handleCanvasClick(mouseX, mouseY) {
    if (this.battleState !== "selecting_replacement" && (this.turn !== "player" || this.isBusy)) return;

    // Check if player clicked a bench card
    this.playerDeck.forEach((c, idx) => {
      if (c.benchBounds && idx !== this.playerActiveIndex && c.currentHp > 0) {
        const { x, y, w, h } = c.benchBounds;
        if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
          this.playerSwitchCard(idx);
        }
      }
    });
  }
}
