export function initProfile(cardCount) {
    const modalOverlay = document.getElementById('modal-overlay');
    const btnCloseModal = document.getElementById('btn-close-modal');

    btnCloseModal.addEventListener('click', () => {
        hideProfile();
    });

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            hideProfile();
        }
    });
}

export function showProfile(user, cardCount) {
    document.getElementById('profile-id').textContent = user.id;
    document.getElementById('profile-card-count').textContent = cardCount;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

export function hideProfile() {
    document.getElementById('modal-overlay').classList.add('hidden');
}
