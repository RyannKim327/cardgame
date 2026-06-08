import * as utils from "./utils.js"
import card from "./widgets/card.js"
import api from "./process/api.js"
import { initAuth, showAuth, hideAuth } from "./ui/auth.js"
import { initLobby, showLobby, hideLobby } from "./ui/lobby.js"
import { initProfile, showProfile } from "./ui/profile.js"

const canvas = document.getElementById("app")
const ctx = canvas.getContext("2d")

if (!ctx) {
    alert("Could not get 2D context")
    throw new Error("Could now get 2D Context")
}

// Application State
let state = {
    currentUser: null,
    view: 'auth', // 'auth' or 'lobby'
    elements: [],
    time: 0
}

async function init() {
    const client = api()
    const response = await client.get("/elements")
    if (!response.error) {
        state.elements = response

        // Initialize UI Modules
        initAuth(handleLogin);
        initLobby(handleLogout, handleShowProfile);
        initProfile();

        resize()
        animate()
    } else {
        setTimeout(() => {
            init()
        }, 2500)
    }
}

function handleLogin(user) {
    state.currentUser = user;
    state.view = 'lobby';
    hideAuth();
    showLobby(user);
}

function handleLogout() {
    state.currentUser = null;
    state.view = 'auth';
    hideLobby();
    showAuth();
}

function handleShowProfile() {
    if (state.currentUser) {
        showProfile(state.currentUser, state.elements.length);
    }
}

function resize() {
    utils.resizeCanvas(canvas, window)
}

function animate() {
    state.time += 0.01
    draw()
    requestAnimationFrame(animate)
}

function draw() {
    // Clear Background
    ctx.fillStyle = "#050a14" // Deep dark navy
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid background for sci-fi feel
    drawGrid();

    if (state.elements.length > 0) {
        // Different rendering based on view
        if (state.view === 'auth') {
            // Background effect: just a few cards floating
            drawBackgroundCards();
        } else {
            // Lobby: Show the actual "deck" or lobby view
            drawLobbyCards();
        }
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
    // Show just a couple of cards drifting as a background
    const driftIndices = [0, 10, 42];
    driftIndices.forEach((idx, i) => {
        const element = state.elements[idx];
        const w = 150;
        const h = w * 1.5;
        const x = 100 + i * 200 + Math.sin(state.time + i) * 20;
        const y = 200 + Math.cos(state.time * 0.5 + i) * 30;

        card(ctx, { w, h, x, y, element, time: state.time });
    });
}

function drawLobbyCards() {
    const sampleIndices = [0, 1, 4, 10, 42, 60, 117, 10, 9, 36]
    const grids = canvas.width > 1000 ? 8 : 4
    const w = canvas.width / (grids * 1.3)
    const xgaps = 30
    const ygaps = 30
    const h = (w * 1.5)

    sampleIndices.forEach((idx, i) => {
        const element = state.elements[idx]
        if (element) {
            card(ctx, {
                w: w,
                h: h,
                x: 50 + (i % grids) * (w + xgaps),
                y: 120 + Math.floor(i / grids) * (h + ygaps), // Shifted down for HUD
                element,
                time: state.time
            })
        }
    })
}

window.addEventListener('load', init)
window.addEventListener('resize', resize)
