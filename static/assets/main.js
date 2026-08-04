import * as utils from "./utils.js"
import card from "./widgets/card.js"
import api from "./process/api.js"
import { initBattleField } from "./ui/battle.js"
import { initAuth, showAuth, hideAuth } from "./ui/auth.js"
import { initLobby, showLobby, hideLobby } from "./ui/lobby.js"
import { initProfile, showProfile } from "./ui/profile.js"
import { gameBackground } from "./component/background.js"

const canvas = document.getElementById("app")
const ctx = canvas.getContext("2d")

if (!ctx) {
  alert("Could not get 2D context")
  throw new Error("Could now get 2D Context")
}

// Application State
let state = {
  currentUser: null,
  view: 'auth', // 'auth', 'lobby', or 'battle'
  elements: [],
  traits: {},
  time: 0
}

async function init() {
  const client = api()
  const response = await client.get("/elements")
  const traitsRes = await client.get("/traits")
  if (!response.error && !traitsRes.error) {
    state.elements = response
    state.traits = traitsRes

    // Initialize UI Modules
    initAuth(handleLogin);
    initLobby(handleLogout, handleShowProfile)
    initBattleField(ctx, canvas, state);
    initProfile();

    resize()
    animate()
  } else {
    // TODO: Automated reload with cooldown of 2.5 seconds
    // This is to prevent the heavy load of accessing the backend
    setTimeout(() => {
      init()
    }, 2500)
  }
}

function handleLogin(user) {
  state.currentUser = user;
  state.view = 'lobby';
  hideAuth();
  showLobby(user, state.elements);
}

function handleLogout() {
  state.currentUser = null;
  state.view = 'auth';
  hideLobby();
  showAuth();
}

function handleShowProfile() {
  if (state.currentUser) {
    const cardCount = Array.isArray(state.currentUser.cards) ? state.currentUser.cards.length : 0;
    showProfile(state.currentUser, cardCount);
  }
}

function resize() {
  utils.resizeCanvas(canvas, window)
}

function animate() {
  state.time += 0.01
  gameBackground(ctx, canvas, state)
  requestAnimationFrame(animate)
}

window.addEventListener('load', init)
window.addEventListener('resize', resize)
