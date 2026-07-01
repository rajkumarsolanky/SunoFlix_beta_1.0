/* ============================================================
   SunoFlix - Core Shared Script
   Loaded on EVERY page, right after js/components/toast.js.
   Provides: TMDB config, offline demo dataset, localStorage
   helpers (auth / watchlist / reviews / settings), nav auth
   state, and page-specific init for Home, Browse, Contact,
   Auth and Movie Detail pages.

   NOTE (Raj): Ye site TMDB API use karti hai. API_KEY abhi
   placeholder hai, isliye site automatically "offline demo
   data" (MOCK_MOVIES) use karti hai taake sab kuch chalta
   rahe. Apni free TMDB key yahan daal do to switch ho jayega:
   https://www.themoviedb.org/settings/api
   ============================================================ */

/* ---------------- Config ---------------- */
const API_KEY = 'your_api_key_here';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/original';
const IMG_BASE_URL_SM = 'https://image.tmdb.org/t/p/w342';

const STORAGE_KEYS = {
    USERS: 'sunoflix_users',
    CURRENT_USER: 'sunoflix_current_user',
    WATCHLIST: 'sunoflix_watchlist_',
    REVIEWS: 'sunoflix_reviews_',
    SETTINGS: 'sunoflix_settings_'
};

/* Are we inside /template/ (sub-pages) or at site root (index.html)? */
const IN_TEMPLATE_DIR = window.location.pathname.includes('/template/');
const PATH_PREFIX = IN_TEMPLATE_DIR ? '' : 'template/';

/* ---------------- Offline demo dataset ---------------- */
/* Used automatically whenever the TMDB API key is missing/invalid
   or a request fails, so the site always has something to show. */
const GENRE_LIST = [
    { id: 'action', name: 'Action', icon: 'fa-fire' },
    { id: 'comedy', name: 'Comedy', icon: 'fa-laugh' },
    { id: 'drama', name: 'Drama', icon: 'fa-theater-masks' },
    { id: 'horror', name: 'Horror', icon: 'fa-ghost' },
    { id: 'scifi', name: 'Sci-Fi', icon: 'fa-robot' },
    { id: 'romance', name: 'Romance', icon: 'fa-heart' },
    { id: 'thriller', name: 'Thriller', icon: 'fa-mask' },
    { id: 'animation', name: 'Animation', icon: 'fa-child' }
];

const MOCK_MOVIES = [
    { id: 1, title: 'Neon Shadows', overview: 'A cybernetic detective hunts a rogue AI through a rain-soaked megacity.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Neon+Shadows', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Neon+Shadows', vote_average: 8.2, release_date: '2025-11-14', runtime: 128, genres: ['action', 'scifi'], original_language: 'en', cast: [{ name: 'Marcus Vale', character: 'Detective Kade' }, { name: 'Lina Osei', character: 'ARIA' }] },
    { id: 2, title: 'Laughing Storm', overview: 'Three estranged siblings reunite for a chaotic road trip across the coast.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Laughing+Storm', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Laughing+Storm', vote_average: 7.1, release_date: '2024-03-01', runtime: 104, genres: ['comedy'], original_language: 'en', cast: [] },
    { id: 3, title: 'Silent Harbor', overview: 'A retired fisherman uncovers a decades-old secret buried beneath his town.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Silent+Harbor', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Silent+Harbor', vote_average: 8.6, release_date: '2023-09-22', runtime: 132, genres: ['drama'], original_language: 'en', cast: [] },
    { id: 4, title: 'The Hollow House', overview: 'A family moves into a house that remembers everyone who ever left it.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Hollow+House', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Hollow+House', vote_average: 7.4, release_date: '2024-10-31', runtime: 98, genres: ['horror'], original_language: 'en', cast: [] },
    { id: 5, title: 'Starbound Voyage', overview: 'The last colony ship must choose between survival and its own humanity.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Starbound+Voyage', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Starbound+Voyage', vote_average: 8.0, release_date: '2026-08-15', runtime: 141, genres: ['scifi'], original_language: 'en', cast: [] },
    { id: 6, title: 'Love in Karachi', overview: 'Two rival food-stall owners fall for each other during a citywide festival.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Love+in+Karachi', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Love+in+Karachi', vote_average: 7.8, release_date: '2024-02-14', runtime: 118, genres: ['romance'], original_language: 'en', cast: [] },
    { id: 7, title: 'Midnight Pursuit', overview: 'An insurance investigator gets pulled into a heist that isn\u2019t what it seems.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Midnight+Pursuit', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Midnight+Pursuit', vote_average: 7.9, release_date: '2025-05-09', runtime: 112, genres: ['thriller'], original_language: 'en', cast: [] },
    { id: 8, title: "Dragon's Legacy", overview: 'A young smith discovers she is the last keeper of an ancient dragon pact.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Dragons+Legacy', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Dragons+Legacy', vote_average: 8.3, release_date: '2023-12-01', runtime: 101, genres: ['animation'], original_language: 'en', cast: [] },
    { id: 9, title: 'Iron Vendetta', overview: 'A disbanded mercenary crew reunites for one last impossible job.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Iron+Vendetta', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Iron+Vendetta', vote_average: 7.6, release_date: '2026-09-20', runtime: 124, genres: ['action'], original_language: 'en', cast: [] },
    { id: 10, title: 'Comedy of Errors Reloaded', overview: 'A wedding planner\u2019s perfect week spirals into glorious disaster.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Comedy+of+Errors', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Comedy+of+Errors', vote_average: 6.9, release_date: '2025-01-17', runtime: 96, genres: ['comedy'], original_language: 'en', cast: [] },
    { id: 11, title: 'Tears of Autumn', overview: 'A pianist confronts the family history she spent a lifetime avoiding.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Tears+of+Autumn', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Tears+of+Autumn', vote_average: 8.8, release_date: '2022-11-11', runtime: 137, genres: ['drama'], original_language: 'en', cast: [] },
    { id: 12, title: 'Whispering Woods', overview: 'Campers discover the forest keeps a very old, very hungry promise.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Whispering+Woods', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Whispering+Woods', vote_average: 7.2, release_date: '2026-10-31', runtime: 99, genres: ['horror'], original_language: 'en', cast: [] },
    { id: 13, title: 'Galactic Drift', overview: 'A salvage crew finds a derelict ship carrying a cargo that shouldn\u2019t exist.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Galactic+Drift', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Galactic+Drift', vote_average: 8.1, release_date: '2025-07-04', runtime: 119, genres: ['scifi'], original_language: 'en', cast: [] },
    { id: 14, title: 'Heartstrings', overview: 'A violinist and a street musician learn to compose something together.', poster_path: 'https://placehold.co/500x750/141414/e50914?text=Heartstrings', backdrop_path: 'https://placehold.co/1280x720/141414/e50914?text=Heartstrings', vote_average: 7.5, release_date: '2023-06-20', runtime: 108, genres: ['romance'], original_language: 'en', cast: [] }
];

/* ---------------- Generic helpers ---------------- */
function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return [...el.querySelectorAll(sel)]; }

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function showLoading(elementId) {
    document.getElementById(elementId)?.classList.remove('hidden');
}
function hideLoading(elementId) {
    document.getElementById(elementId)?.classList.add('hidden');
}

/* Demo-only obfuscation. NOT real security - this is a frontend-only
   demo with no backend, so never store real passwords this way in
   production (your PEA project's Postgres backend is the right model). */
function simpleHash(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

/* ---------------- Auth storage ---------------- */
function getUsers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || []; }
    catch { return []; }
}
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}
function getCurrentUser() {
    const email = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!email) return null;
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}
function setCurrentUser(email) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, email);
}
function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}
function signupUser({ fullName, email, password }) {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, message: 'Ye email pehle se registered hai.' };
    }
    const newUser = { id: 'u_' + Date.now(), fullName, email, password: simpleHash(password), createdAt: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(email);
    return { ok: true, user: newUser };
}
function loginUser(email, password) {
    const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== simpleHash(password)) {
        return { ok: false, message: 'Email ya password galat hai.' };
    }
    setCurrentUser(email);
    return { ok: true, user };
}

/* ---------------- Watchlist storage ---------------- */
function getWatchlist(email) {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST + email)) || []; }
    catch { return []; }
}
function saveWatchlist(email, list) {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST + email, JSON.stringify(list));
}
function isInWatchlist(email, movieId) {
    return getWatchlist(email).some(m => String(m.id) === String(movieId));
}
function toggleWatchlist(movie) {
    const user = getCurrentUser();
    if (!user) {
        showToast('Watchlist mein add karne ke liye pehle login karein', 'warning');
        return false;
    }
    let list = getWatchlist(user.email);
    const exists = list.some(m => String(m.id) === String(movie.id));
    if (exists) {
        list = list.filter(m => String(m.id) !== String(movie.id));
        showToast(`"${movie.title}" watchlist se remove ho gaya`, 'info');
    } else {
        list.push(movie);
        showToast(`"${movie.title}" watchlist mein add ho gaya`, 'success');
    }
    saveWatchlist(user.email, list);
    return !exists;
}

/* ---------------- Reviews storage ---------------- */
function getReviews(email) {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS + email)) || []; }
    catch { return []; }
}
function saveReviews(email, reviews) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS + email, JSON.stringify(reviews));
}
function addReview(movie, rating, text) {
    const user = getCurrentUser();
    if (!user) {
        showToast('Review dene ke liye pehle login karein', 'warning');
        return null;
    }
    const reviews = getReviews(user.email);
    const review = { id: 'r_' + Date.now(), movieId: movie.id, movieTitle: movie.title, poster: movie.poster_path, rating, text, date: new Date().toISOString() };
    reviews.unshift(review);
    saveReviews(user.email, reviews);
    return review;
}

/* ---------------- Settings storage ---------------- */
function getSettings(email) {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS + email)) || null; }
    catch { return null; }
}
function saveSettings(email, settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS + email, JSON.stringify(settings));
}

/* ---------------- TMDB fetch with offline fallback ---------------- */
async function fetchMovies(endpoint, params = '') {
    if (!API_KEY || API_KEY === 'your_api_key_here') return null;
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}?api_key=${API_KEY}${params}`);
        if (!res.ok) throw new Error('TMDB request failed');
        return await res.json();
    } catch (err) {
        console.warn('TMDB unavailable, using offline demo data:', err.message);
        return null;
    }
}

function normalizeApiMovie(data) {
    return {
        id: data.id,
        title: data.title,
        overview: data.overview,
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
        vote_average: data.vote_average,
        release_date: data.release_date,
        runtime: data.runtime,
        genres: (data.genres || []).map(g => g.name),
        original_language: data.original_language,
        cast: (data.credits?.cast || []).slice(0, 8).map(c => ({ name: c.name, character: c.character }))
    };
}

function getPosterUrl(path) {
    if (!path) return 'https://placehold.co/500x750/141414/e50914?text=No+Poster';
    return path.startsWith('http') ? path : `${IMG_BASE_URL_SM}${path}`;
}
function getBackdropUrl(path) {
    if (!path) return 'https://placehold.co/1280x720/141414/e50914?text=SunoFlix';
    return path.startsWith('http') ? path : `${IMG_BASE_URL}${path}`;
}

/* Category helper shared by Home / Browse / Movies pages */
async function getMovieListForCategory(category) {
    const endpointMap = {
        all: '/discover/movie',
        trending: '/trending/movie/week',
        new: '/movie/now_playing',
        top: '/movie/top_rated',
        upcoming: '/movie/upcoming'
    };
    const data = await fetchMovies(endpointMap[category] || endpointMap.trending);
    if (data && data.results) return data.results;

    let list = [...MOCK_MOVIES];
    if (category === 'top') list.sort((a, b) => b.vote_average - a.vote_average);
    else if (category === 'new') list.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    else if (category === 'upcoming') list = list.filter(m => new Date(m.release_date) > new Date());
    else if (category === 'trending') list.sort((a, b) => b.vote_average - a.vote_average);
    return list;
}

/* ---------------- Movie card (used on every page) ---------------- */
function createMovieCard(movie) {
    window.__movieCache = window.__movieCache || {};
    window.__movieCache[movie.id] = movie;

    const user = getCurrentUser();
    const inList = user ? isInWatchlist(user.email, movie.id) : false;
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = (movie.vote_average || 0).toFixed(1);

    return `
        <div class="movie-card" data-id="${movie.id}">
            <button class="watchlist-btn ${inList ? 'active' : ''}" data-watchlist-id="${movie.id}" aria-label="Toggle watchlist">
                <i class="fas fa-${inList ? 'check' : 'plus'}"></i>
            </button>
            <a href="${PATH_PREFIX}movie-detail.html?id=${movie.id}">
                <img src="${getPosterUrl(movie.poster_path)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                <div class="movie-info">
                    <h3>${escapeHtml(movie.title)}</h3>
                    <div class="movie-meta">
                        <span class="rating"><i class="fas fa-star"></i> ${rating}</span>
                        <span class="year">${year}</span>
                    </div>
                </div>
            </a>
        </div>
    `;
}

/* ---------------- Shared: nav auth state + delegated watchlist clicks ---------------- */
function updateNavAuthUI() {
    const user = getCurrentUser();
    qsa('.profile-link').forEach(link => {
        if (user) {
            link.innerHTML = `<div class="nav-avatar-circle">${escapeHtml(user.fullName.charAt(0).toUpperCase())}</div>`;
            link.title = `Logged in as ${user.fullName}`;
        } else {
            link.innerHTML = `<i class="fas fa-user"></i>`;
            link.title = 'Login / Sign up';
        }
    });
}

function initWatchlistButtons() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.watchlist-btn');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.watchlistId;
        const movie = (window.__movieCache || {})[id];
        if (!movie) return;
        const added = toggleWatchlist(movie);
        btn.classList.toggle('active', added);
        btn.innerHTML = `<i class="fas fa-${added ? 'check' : 'plus'}"></i>`;

        const watchlistCountEl = document.getElementById('watchlistCount');
        const user = getCurrentUser();
        if (watchlistCountEl && user) watchlistCountEl.textContent = getWatchlist(user.email).length;
    });
}

function initCookieConsent() {
    const consent = document.getElementById('cookieConsent');
    if (!consent) return;
    const accepted = localStorage.getItem('sunoflix_cookie_consent');
    if (!accepted) setTimeout(() => consent.classList.remove('hidden'), 800);

    document.getElementById('acceptCookies')?.addEventListener('click', () => {
        localStorage.setItem('sunoflix_cookie_consent', 'accepted');
        consent.classList.add('hidden');
    });
    document.getElementById('cookieSettings')?.addEventListener('click', () => {
        localStorage.setItem('sunoflix_cookie_consent', 'settings-only');
        consent.classList.add('hidden');
        showToast('Cookie preferences saved', 'info');
    });
}

/* ============================================================
   HOME PAGE (index.html)
   ============================================================ */
async function initHomePage() {
    await loadFeaturedCarousel();
    await loadLatestReleases();
    await loadCategoryContent('trending');
    setupCarousel();
    setupCategoryTabs();
    initNewsletterForm();
}

async function loadFeaturedCarousel() {
    const carousel = qs('.carousel');
    if (!carousel) return;
    const movies = await getMovieListForCategory('trending');
    carousel.innerHTML = movies.slice(0, 10).map(createMovieCard).join('');
}

async function loadLatestReleases() {
    const grid = qs('.latest .movie-grid');
    if (!grid) return;
    showLoading('latestLoading');
    const movies = await getMovieListForCategory('new');
    grid.innerHTML = movies.slice(0, 8).map(createMovieCard).join('');
    hideLoading('latestLoading');
}

async function loadCategoryContent(category) {
    const content = document.getElementById('trending-content');
    if (!content) return;
    content.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
    const movies = await getMovieListForCategory(category);
    content.innerHTML = `<div class="movie-grid">${movies.slice(0, 8).map(createMovieCard).join('')}</div>`;
}

function setupCategoryTabs() {
    const tabs = qsa('.categories .tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            await loadCategoryContent(tab.dataset.category);
        });
    });
}

function setupCarousel() {
    const carousel = qs('.carousel');
    if (!carousel) return;
    const prevBtn = qs('.carousel-button.prev');
    const nextBtn = qs('.carousel-button.next');
    let scrollPosition = 0;
    const scrollAmount = 300;

    nextBtn?.addEventListener('click', () => {
        scrollPosition += scrollAmount;
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    });
    prevBtn?.addEventListener('click', () => {
        scrollPosition = Math.max(0, scrollPosition - scrollAmount);
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    });
}

function initNewsletterForm() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletterEmail');
        const feedback = form.querySelector('.form-feedback');
        const email = emailInput.value.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            feedback.textContent = 'Sahi email address daalein.';
            feedback.classList.remove('hidden');
            return;
        }
        const subs = JSON.parse(localStorage.getItem('sunoflix_newsletter') || '[]');
        if (!subs.includes(email)) subs.push(email);
        localStorage.setItem('sunoflix_newsletter', JSON.stringify(subs));

        feedback.classList.add('hidden');
        showToast('Newsletter subscribe ho gaya! Shukriya.', 'success');
        form.reset();
    });
}

/* ============================================================
   BROWSE PAGE (template/browse.html)
   ============================================================ */
function initBrowsePage() {
    populateBrowseGenres();
    loadBrowseTrending();
    loadBrowseTopRated();
}

function populateBrowseGenres() {
    const grid = qs('.genre-section .genre-grid');
    if (!grid) return;
    grid.innerHTML = GENRE_LIST.map(g => `
        <div class="genre-card" data-genre="${g.id}">
            <i class="fas ${g.icon}"></i>
            <span>${g.name}</span>
        </div>
    `).join('');
    grid.addEventListener('click', (e) => {
        const card = e.target.closest('.genre-card');
        if (!card) return;
        window.location.href = `movies.html?genre=${card.dataset.genre}`;
    });
}

async function loadBrowseTrending() {
    showLoading('trendingLoading');
    const grid = qs('.trending-section .movie-grid');
    const movies = await getMovieListForCategory('trending');
    if (grid) grid.innerHTML = movies.slice(0, 8).map(createMovieCard).join('');
    hideLoading('trendingLoading');
}

async function loadBrowseTopRated() {
    const grid = qs('.top-rated-section .movie-grid');
    const movies = await getMovieListForCategory('top');
    if (grid) grid.innerHTML = movies.slice(0, 8).map(createMovieCard).join('');
}

/* ============================================================
   CONTACT PAGE (template/contact.html)
   ============================================================ */
function initContactPage() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const fields = ['name', 'email', 'subject', 'message'];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        fields.forEach(id => {
            const input = document.getElementById(id);
            const errorEl = input.closest('.form-group')?.querySelector('.error-message');
            input.classList.remove('input-error');
            if (errorEl) errorEl.textContent = '';

            if (!input.value.trim()) {
                valid = false;
                input.classList.add('input-error');
                if (errorEl) errorEl.textContent = 'Ye field zaroori hai.';
            } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
                valid = false;
                input.classList.add('input-error');
                if (errorEl) errorEl.textContent = 'Sahi email daalein.';
            } else if (id === 'name' && !/^[A-Za-z\s]{2,}$/.test(input.value.trim())) {
                valid = false;
                input.classList.add('input-error');
                if (errorEl) errorEl.textContent = 'Sirf letters use karein (min 2 characters).';
            }
        });

        if (!valid) return;

        showLoading('contactLoading');
        const submitBtn = form.querySelector('.submit-button');
        submitBtn.disabled = true;

        setTimeout(() => {
            hideLoading('contactLoading');
            submitBtn.disabled = false;

            const messages = JSON.parse(localStorage.getItem('sunoflix_messages') || '[]');
            messages.push({
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                date: new Date().toISOString()
            });
            localStorage.setItem('sunoflix_messages', JSON.stringify(messages));

            showToast('Message bhej diya gaya! Hum jald reply karenge.', 'success');
            form.reset();
        }, 900);
    });
}

/* ============================================================
   AUTH PAGE (template/auth.html)
   ============================================================ */
function initAuthPage() {
    if (getCurrentUser()) {
        showToast('Aap pehle se logged in hain', 'info');
        setTimeout(() => window.location.href = 'profile.html', 1000);
    }

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const resetForm = document.getElementById('resetForm');
    const resetModal = document.getElementById('resetModal');

    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        showLoading('loginLoading');
        setTimeout(() => {
            hideLoading('loginLoading');
            const result = loginUser(email, password);
            if (result.ok) {
                showToast(`Welcome back, ${result.user.fullName}!`, 'success');
                setTimeout(() => window.location.href = 'profile.html', 700);
            } else {
                showToast(result.message, 'error');
            }
        }, 500);
    });

    signupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (password.length < 6) { showToast('Password kam se kam 6 characters ka hona chahiye.', 'error'); return; }
        if (password !== confirm) { showToast('Passwords match nahi kar rahe.', 'error'); return; }

        showLoading('signupLoading');
        setTimeout(() => {
            hideLoading('signupLoading');
            const result = signupUser({ fullName, email, password });
            if (result.ok) {
                showToast(`Account ban gaya! Welcome, ${fullName}.`, 'success');
                setTimeout(() => window.location.href = 'profile.html', 700);
            } else {
                showToast(result.message, 'error');
            }
        }, 500);
    });

    function closeResetModal() {
        resetModal?.classList.add('hidden');
        resetModal?.classList.remove('active');
    }
    document.getElementById('showReset')?.addEventListener('click', (e) => {
        e.preventDefault();
        resetModal?.classList.remove('hidden');
        resetModal?.classList.add('active');
    });
    document.getElementById('closeResetModal')?.addEventListener('click', closeResetModal);
    document.getElementById('cancelReset')?.addEventListener('click', closeResetModal);

    resetForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();
        const exists = getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
        showToast(exists ? 'Reset link is email par bhej diya gaya (demo).' : 'Is email se koi account nahi mila.', exists ? 'success' : 'error');
        closeResetModal();
        resetForm.reset();
    });

    document.getElementById('showSignup')?.addEventListener('click', (e) => {
        e.preventDefault();
        qs('.signup-side')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('fullName')?.focus();
    });
    document.getElementById('showLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        qs('.login-side')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('loginEmail')?.focus();
    });
}

/* ============================================================
   MOVIE DETAIL PAGE (template/movie-detail.html)
   ============================================================ */
async function initMovieDetailPage() {
    const id = getUrlParam('id') || '1';
    let movie = null;

    const data = await fetchMovies(`/movie/${id}`, '&append_to_response=credits');
    if (data && data.id) {
        movie = normalizeApiMovie(data);
    } else {
        movie = MOCK_MOVIES.find(m => String(m.id) === String(id)) || MOCK_MOVIES[0];
    }
    window.__movieCache = window.__movieCache || {};
    window.__movieCache[movie.id] = movie;

    const hero = qs('.movie-detail-hero');
    hero.style.backgroundImage = `linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.35)), url('${getBackdropUrl(movie.backdrop_path)}')`;
    hero.classList.remove('loading');

    qs('.movie-title-large').textContent = movie.title;
    qs('.release-date span:last-child').textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    qs('.duration span:last-child').textContent = movie.runtime ? `${movie.runtime} min` : 'N/A';
    qs('.genre span:last-child').textContent = (movie.genres || []).join(', ') || 'N/A';
    qs('.rating-value').textContent = (movie.vote_average || 0).toFixed(1);
    document.getElementById('plotSummary').textContent = movie.overview || 'Koi description available nahi hai.';

    const playBtn = qs('.play-button');
    playBtn.disabled = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    playBtn.addEventListener('click', () => showToast('Demo mode: playback available nahi hai.', 'info'));

    const watchlistBtn = qs('.add-watchlist');
    watchlistBtn.disabled = false;
    const user = getCurrentUser();
    let inList = user ? isInWatchlist(user.email, movie.id) : false;
    watchlistBtn.innerHTML = `<i class="fas fa-${inList ? 'check' : 'plus'}"></i> ${inList ? 'In Watchlist' : 'Add to Watchlist'}`;
    watchlistBtn.addEventListener('click', () => {
        inList = toggleWatchlist(movie);
        watchlistBtn.innerHTML = `<i class="fas fa-${inList ? 'check' : 'plus'}"></i> ${inList ? 'In Watchlist' : 'Add to Watchlist'}`;
    });

    // Cast
    hideLoading('castLoading');
    const castList = document.getElementById('castList');
    const cast = (movie.cast && movie.cast.length) ? movie.cast : [
        { name: 'Demo Actor 1', character: 'Lead Role' },
        { name: 'Demo Actor 2', character: 'Supporting Role' },
        { name: 'Demo Actor 3', character: 'Supporting Role' }
    ];
    castList.innerHTML = cast.slice(0, 8).map(c => `
        <div class="cast-card">
            <img src="https://placehold.co/200x300/222222/ffffff?text=${encodeURIComponent((c.name || '?').split(' ')[0])}" alt="${escapeHtml(c.name)}">
            <h4>${escapeHtml(c.name)}</h4>
            <p>${escapeHtml(c.character || '')}</p>
        </div>
    `).join('');

    // Trailer (not available in offline demo mode)
    hideLoading('trailerLoading');
    qs('.video-container').innerHTML = `<div class="offline-banner"><i class="fas fa-circle-info"></i> Trailer demo mode mein available nahi hai. Apni TMDB API key add karke live trailers dekhein.</div>`;

    // Similar movies
    hideLoading('similarLoading');
    const similar = MOCK_MOVIES.filter(m => String(m.id) !== String(movie.id)).slice(0, 4);
    qs('.similar-movies .movie-grid').innerHTML = similar.map(createMovieCard).join('');

    document.getElementById('loadingOverlay')?.classList.add('hidden');
}

/* ============================================================
   Shared init + page router
   ============================================================ */
function initCommon() {
    updateNavAuthUI();
    initWatchlistButtons();
    initCookieConsent();
}

document.addEventListener('DOMContentLoaded', () => {
    initCommon();

    const path = window.location.pathname;
    if (path.endsWith('/') || path.endsWith('/index.html')) {
        initHomePage();
    } else if (path.includes('browse.html')) {
        initBrowsePage();
    } else if (path.includes('contact.html')) {
        initContactPage();
    } else if (path.includes('movie-detail.html')) {
        initMovieDetailPage();
    } else if (path.includes('auth.html')) {
        initAuthPage();
    }
    // movies.html -> js/movies.js, profile.html -> js/profile.js
});
