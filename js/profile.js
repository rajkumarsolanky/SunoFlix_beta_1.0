/* ============================================================
   SunoFlix - Profile Page
   Depends on: js/components/toast.js + js/script.js (loaded first)
   ============================================================ */

let profileState = { user: null };

function initProfilePage() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Profile dekhne ke liye pehle login karein', 'warning');
        setTimeout(() => window.location.href = 'auth.html', 1000);
        return;
    }
    profileState.user = user;

    renderProfileHeader();
    bindTabs();
    renderWatchlistTab();
    bindWatchlistSort();
    bindClearWatchlist();
    renderReviewsTab();
    initSettingsForm();
    bindAvatarUpload();
    bindEditName();
    bindSubscriptionActions();
    bindLogout();
    ensureProfileUIState();
}

function renderProfileHeader() {
    const user = profileState.user;
    if (!user) return;

    const userNameEl = document.getElementById('userName');
    const memberDateEl = document.getElementById('memberDate');
    const avatarEl = document.getElementById('profileAvatar');

    if (userNameEl) userNameEl.textContent = user.fullName || 'User';

    const createdAt = user.createdAt || new Date().toISOString();
    const memberDate = new Date(createdAt);
    if (memberDateEl) {
        memberDateEl.textContent = Number.isNaN(memberDate.getTime())
            ? 'Recently Joined'
            : memberDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    const settings = getSettings(user.email);
    if (settings?.avatar && avatarEl) avatarEl.src = settings.avatar;

    const watchlist = getWatchlist(user.email);
    const reviews = getReviews(user.email);
    const watchedCountEl = document.getElementById('watchedCount');
    const watchlistCountEl = document.getElementById('watchlistCount');
    const reviewCountEl = document.getElementById('reviewCount');

    if (watchlistCountEl) watchlistCountEl.textContent = watchlist.length;
    if (reviewCountEl) reviewCountEl.textContent = reviews.length;
    if (watchedCountEl) watchedCountEl.textContent = reviews.length;
}

function bindTabs() {
    const tabs = qsa('.profile-tabs .tab-button');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            qsa('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(tab.dataset.tab);
            if (target) target.classList.add('active');
        });
    });
}

function ensureProfileUIState() {
    const activeTab = document.querySelector('.profile-tabs .tab-button.active');
    if (!activeTab) {
        const firstTab = document.querySelector('.profile-tabs .tab-button');
        if (firstTab) firstTab.classList.add('active');
    }

    const activePanel = document.querySelector('.tab-content.active');
    if (!activePanel) {
        const firstPanel = document.querySelector('.tab-content');
        if (firstPanel) firstPanel.classList.add('active');
    }
}

/* ---------------- Watchlist tab ---------------- */
function renderWatchlistTab(sortBy = 'date-added') {
    const user = profileState.user;
    let list = getWatchlist(user.email);
    if (sortBy === 'name') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'rating') list = [...list].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

    const grid = document.getElementById('watchlistGrid');
    const empty = document.getElementById('watchlistEmpty');
    if (!list.length) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');
    grid.innerHTML = list.map(createMovieCard).join('');
}

function bindWatchlistSort() {
    document.getElementById('watchlistSort')?.addEventListener('change', (e) => renderWatchlistTab(e.target.value));
}

function bindClearWatchlist() {
    document.getElementById('clearWatchlist')?.addEventListener('click', () => {
        if (!getWatchlist(profileState.user.email).length) {
            showToast('Watchlist pehle se khaali hai', 'info');
            return;
        }
        showConfirmation('Kya aap poori watchlist clear karna chahte hain?', () => {
            saveWatchlist(profileState.user.email, []);
            renderWatchlistTab();
            renderProfileHeader();
            showToast('Watchlist clear ho gayi', 'info');
        });
    });
}

/* ---------------- Reviews tab ---------------- */
function renderReviewsTab() {
    const user = profileState.user;
    const reviews = getReviews(user.email);
    const list = document.getElementById('userReviews');
    const empty = document.getElementById('reviewsEmpty');

    if (!reviews.length) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');
    list.innerHTML = reviews.map(r => `
        <div class="review-card" data-id="${r.id}">
            <div class="review-card-header">
                <h4>${escapeHtml(r.movieTitle)}</h4>
                <button class="review-delete-btn" data-id="${r.id}" aria-label="Delete review"><i class="fas fa-trash"></i></button>
            </div>
            <div class="review-rating">${'\u2605'.repeat(r.rating)}${'\u2606'.repeat(5 - r.rating)}</div>
            <p>${escapeHtml(r.text)}</p>
            <span class="review-date">${new Date(r.date).toLocaleDateString()}</span>
        </div>
    `).join('');

    list.querySelectorAll('.review-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showConfirmation('Ye review delete karna hai?', () => {
                const remaining = getReviews(profileState.user.email).filter(r => r.id !== btn.dataset.id);
                saveReviews(profileState.user.email, remaining);
                renderReviewsTab();
                renderProfileHeader();
                showToast('Review delete ho gayi', 'info');
            });
        });
    });
}

/* ---------------- Settings tab ---------------- */
function initSettingsForm() {
    const user = profileState.user;
    const settings = getSettings(user.email) || { fullName: user.fullName, email: user.email, language: 'en', notifications: [], profileVisibility: false };

    const fullNameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('email');
    const languageEl = document.getElementById('language');
    const profileVisibilityEl = document.getElementById('profileVisibility');

    if (fullNameEl) fullNameEl.value = settings.fullName || user.fullName;
    if (emailEl) emailEl.value = settings.email || user.email;
    if (languageEl) languageEl.value = settings.language || 'en';
    qsa('input[name="notifications"]').forEach(cb => { cb.checked = (settings.notifications || []).includes(cb.value); });
    if (profileVisibilityEl) profileVisibilityEl.checked = !!settings.profileVisibility;

    const saveBtn = qs('.settings-actions .btn-primary');
    saveBtn?.replaceWith(saveBtn.cloneNode(true));
    const newSaveBtn = qs('.settings-actions .btn-primary');
    newSaveBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        const loader = newSaveBtn.querySelector('.button-loader');
        loader?.classList.remove('hidden');

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const language = document.getElementById('language').value;
        const notifications = qsa('input[name="notifications"]:checked').map(cb => cb.value);
        const profileVisibility = document.getElementById('profileVisibility').checked;

        setTimeout(() => {
            const newSettings = { ...settings, fullName, email, language, notifications, profileVisibility };
            saveSettings(user.email, newSettings);

            const users = getUsers();
            const idx = users.findIndex(u => u.email === user.email);
            if (idx > -1) {
                users[idx].fullName = fullName;
                users[idx].email = email;
                saveUsers(users);
            }

            profileState.user = { ...user, fullName, email };
            renderProfileHeader();
            loader?.classList.add('hidden');
            showToast('Settings save ho gayin', 'success');
        }, 500);
    });

    document.getElementById('resetSettings')?.addEventListener('click', () => {
        initSettingsForm();
        showToast('Settings reset ho gayin', 'info');
    });
}

/* ---------------- Avatar upload ---------------- */
function bindAvatarUpload() {
    const editBtn = document.querySelector('.edit-avatar');
    const input = document.getElementById('avatarInput');
    const loading = document.querySelector('.avatar-loading');

    editBtn?.addEventListener('click', () => input.click());
    input?.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 1024 * 1024) {
            showToast('Image 1MB se choti honi chahiye', 'error');
            return;
        }
        loading?.classList.remove('hidden');
        const reader = new FileReader();
        reader.onload = () => {
            document.getElementById('profileAvatar').src = reader.result;
            const settings = getSettings(profileState.user.email) || {};
            settings.avatar = reader.result;
            saveSettings(profileState.user.email, settings);
            loading?.classList.add('hidden');
            showToast('Profile picture update ho gayi', 'success');
        };
        reader.readAsDataURL(file);
    });
}

/* ---------------- Edit name ---------------- */
function bindEditName() {
    document.querySelector('.edit-name')?.addEventListener('click', () => {
        const newName = prompt('Naya naam likhein:', profileState.user.fullName);
        if (!newName || !newName.trim()) return;
        const trimmed = newName.trim();

        const users = getUsers();
        const idx = users.findIndex(u => u.email === profileState.user.email);
        if (idx > -1) { users[idx].fullName = trimmed; saveUsers(users); }
        profileState.user.fullName = trimmed;

        document.getElementById('userName').textContent = trimmed;
        document.getElementById('fullName').value = trimmed;

        const settings = getSettings(profileState.user.email) || {};
        settings.fullName = trimmed;
        saveSettings(profileState.user.email, settings);

        showToast('Naam update ho gaya', 'success');
    });
}

/* ---------------- Subscription tab ---------------- */
function bindSubscriptionActions() {
    document.getElementById('changePlan')?.addEventListener('click', () => showToast('Plan change demo mode mein available nahi hai.', 'info'));
    document.getElementById('cancelSubscription')?.addEventListener('click', () => {
        showConfirmation('Kya aap subscription cancel karna chahte hain?', () => showToast('Subscription cancel kar diya gaya (demo)', 'warning'));
    });
    document.getElementById('viewBillingHistory')?.addEventListener('click', () => showToast('Demo mode mein billing history available nahi hai.', 'info'));
}

/* ---------------- Logout ---------------- */
function bindLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        logoutUser();
        showToast('Logout ho gaye', 'info');
        setTimeout(() => window.location.href = '../index.html', 700);
    });
}

/* ---------------- Generic confirmation modal ---------------- */
function showConfirmation(message, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    document.getElementById('confirmationMessage').textContent = message;
    modal.classList.remove('hidden');
    modal.classList.add('active');

    const confirmBtn = document.getElementById('confirmAction');
    const cancelBtn = document.getElementById('cancelAction');

    function cleanup() {
        modal.classList.add('hidden');
        modal.classList.remove('active');
        confirmBtn.removeEventListener('click', onConfirmHandler);
        cancelBtn.removeEventListener('click', cleanup);
    }
    function onConfirmHandler() { onConfirm(); cleanup(); }

    confirmBtn.addEventListener('click', onConfirmHandler);
    cancelBtn.addEventListener('click', cleanup);
}

document.addEventListener('DOMContentLoaded', initProfilePage);
