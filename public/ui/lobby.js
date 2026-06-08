export function initLobby(onLogout, onShowProfile) {
    const btnLogout = document.getElementById('btn-logout');
    const btnProfile = document.getElementById('btn-profile');

    btnLogout.addEventListener('click', () => {
        onLogout();
    });

    btnProfile.addEventListener('click', () => {
        onShowProfile();
    });
}

export function showLobby(user) {
    document.getElementById('lobby-view').classList.remove('hidden');
    document.getElementById('display-username').textContent = user.username.toUpperCase();
}

export function hideLobby() {
    document.getElementById('lobby-view').classList.add('hidden');
}
