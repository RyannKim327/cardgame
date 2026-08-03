import { scrollLobby, resetLobbyScroll } from "../component/background.js";

export function initLobby(onLogout, onShowProfile) {
  const btnLogout = document.getElementById('btn-logout');
  const btnProfile = document.getElementById('btn-profile');
  const btnScrollUp = document.getElementById('btn-scroll-up');
  const btnScrollDown = document.getElementById('btn-scroll-down');
  const canvas = document.getElementById('app');

  btnLogout.addEventListener('click', () => {
    onLogout();
  });

  btnProfile.addEventListener('click', () => {
    onShowProfile();
  });

  if (btnScrollUp) {
    btnScrollUp.addEventListener('click', () => {
      scrollLobby(-180);
    });
  }

  if (btnScrollDown) {
    btnScrollDown.addEventListener('click', () => {
      scrollLobby(180);
    });
  }

  // Mouse wheel scroll support on canvas for Lobby View
  window.addEventListener('wheel', (e) => {
    const lobbyView = document.getElementById('lobby-view');
    if (lobbyView && !lobbyView.classList.contains('hidden')) {
      scrollLobby(e.deltaY > 0 ? 120 : -120);
    }
  }, { passive: true });
}

export function showLobby(user, elements = []) {
  resetLobbyScroll();
  document.getElementById('lobby-view').classList.remove('hidden');
  document.getElementById('display-username').textContent = user ? user.username.toUpperCase() : "GUEST";
}

export function hideLobby() {
  document.getElementById('lobby-view').classList.add('hidden');
}
