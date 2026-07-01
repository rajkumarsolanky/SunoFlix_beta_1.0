/* ============================================================
   SunoFlix - Movies Listing Page
   Depends on: js/components/toast.js + js/script.js (loaded first)
   ============================================================ */

let moviesState = {
    all: [],
    filtered: [],
    page: 1,
    perPage: 8,
    category: 'all',
    search: '',
    filters: { yearFrom: null, yearTo: null, minRating: 0, genres: [], language: '' },
    sort: 'popularity.desc'
};

async function initMoviesPage() {
    const genreParam = getUrlParam('genre');
    if (genreParam) moviesState.filters.genres = [genreParam];

    bindSearch();
    bindFilters();
    bindTabs();
    bindSort();
    bindPagination();
    populateGenreTags();
    renderActiveFilterTags();

    await loadMoviesDataset('all');
    applyFiltersAndRender();
}

async function loadMoviesDataset(category) {
    showLoading('loading');
    moviesState.category = category;
    moviesState.all = await getMovieListForCategory(category);
    hideLoading('loading');
}

function bindTabs() {
    qsa('.movie-categories .tab-button').forEach(tab => {
        tab.addEventListener('click', async () => {
            qsa('.movie-categories .tab-button').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            await loadMoviesDataset(tab.dataset.category);
            moviesState.page = 1;
            applyFiltersAndRender();
        });
    });
}

function bindSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    const suggestions = document.getElementById('searchSuggestions');
    if (!input) return;

    input.addEventListener('input', debounce(() => {
        moviesState.search = input.value.trim();
        clearBtn.classList.toggle('hidden', !moviesState.search);
        renderSuggestions(moviesState.search);
        moviesState.page = 1;
        applyFiltersAndRender();
    }, 400));

    clearBtn?.addEventListener('click', () => {
        input.value = '';
        moviesState.search = '';
        clearBtn.classList.add('hidden');
        suggestions.innerHTML = '';
        applyFiltersAndRender();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) suggestions.innerHTML = '';
    });
}

function renderSuggestions(term) {
    const suggestions = document.getElementById('searchSuggestions');
    if (!suggestions) return;
    if (!term) { suggestions.innerHTML = ''; return; }

    const matches = moviesState.all.filter(m => m.title.toLowerCase().includes(term.toLowerCase())).slice(0, 5);
    if (!matches.length) { suggestions.innerHTML = ''; return; }

    suggestions.innerHTML = matches.map(m => `
        <div class="search-suggestion-item" data-id="${m.id}">
            <img src="${getPosterUrl(m.poster_path)}" alt="">
            <span>${escapeHtml(m.title)}</span>
        </div>
    `).join('');

    suggestions.querySelectorAll('.search-suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            window.location.href = `movie-detail.html?id=${item.dataset.id}`;
        });
    });
}

function populateGenreTags() {
    const container = document.getElementById('genreTags');
    if (!container) return;
    container.innerHTML = GENRE_LIST.map(g => `<span class="genre-tag" data-genre="${g.id}">${g.name}</span>`).join('');
    container.querySelectorAll('.genre-tag').forEach(tag => {
        if (moviesState.filters.genres.includes(tag.dataset.genre)) tag.classList.add('active');
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
            const genre = tag.dataset.genre;
            if (moviesState.filters.genres.includes(genre)) {
                moviesState.filters.genres = moviesState.filters.genres.filter(g => g !== genre);
            } else {
                moviesState.filters.genres.push(genre);
            }
        });
    });
}

function bindFilters() {
    const toggle = document.querySelector('.filter-toggle');
    const panel = document.getElementById('filterPanel');
    toggle?.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        toggle.setAttribute('aria-expanded', String(!panel.classList.contains('hidden')));
    });

    const ratingInput = document.getElementById('rating');
    ratingInput?.addEventListener('input', () => {
        qs('.rating-slider .rating-value').textContent = `${ratingInput.value}+`;
    });

    document.getElementById('applyFilters')?.addEventListener('click', () => {
        moviesState.filters.yearFrom = document.getElementById('yearFrom').value || null;
        moviesState.filters.yearTo = document.getElementById('yearTo').value || null;
        moviesState.filters.minRating = parseFloat(ratingInput.value) || 0;
        moviesState.filters.language = document.getElementById('language').value;
        moviesState.page = 1;
        renderActiveFilterTags();
        applyFiltersAndRender();
        panel.classList.add('hidden');
    });

    document.getElementById('resetFilters')?.addEventListener('click', () => {
        moviesState.filters = { yearFrom: null, yearTo: null, minRating: 0, genres: [], language: '' };
        document.getElementById('yearFrom').value = '';
        document.getElementById('yearTo').value = '';
        ratingInput.value = 0;
        qs('.rating-slider .rating-value').textContent = '0+';
        document.getElementById('language').value = '';
        populateGenreTags();
        moviesState.page = 1;
        renderActiveFilterTags();
        applyFiltersAndRender();
    });

    document.getElementById('resetSearch')?.addEventListener('click', () => {
        const input = document.getElementById('searchInput');
        input.value = '';
        moviesState.search = '';
        moviesState.filters = { yearFrom: null, yearTo: null, minRating: 0, genres: [], language: '' };
        populateGenreTags();
        renderActiveFilterTags();
        applyFiltersAndRender();
    });
}

function renderActiveFilterTags() {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    const f = moviesState.filters;
    const tags = [];
    if (f.yearFrom || f.yearTo) tags.push(`Year: ${f.yearFrom || 'Any'} - ${f.yearTo || 'Any'}`);
    if (f.minRating > 0) tags.push(`Rating: ${f.minRating}+`);
    if (f.language) tags.push(`Language: ${f.language}`);
    f.genres.forEach(g => {
        const genreObj = GENRE_LIST.find(x => x.id === g);
        tags.push(genreObj ? genreObj.name : g);
    });
    container.innerHTML = tags.map(t => `<span class="genre-tag active">${escapeHtml(t)}</span>`).join('');
}

function bindSort() {
    document.getElementById('sortBy')?.addEventListener('change', (e) => {
        moviesState.sort = e.target.value;
        applyFiltersAndRender();
    });
}

function bindPagination() {
    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (moviesState.page > 1) { moviesState.page--; renderMovies(); }
    });
    document.getElementById('nextPage')?.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(moviesState.filtered.length / moviesState.perPage));
        if (moviesState.page < totalPages) { moviesState.page++; renderMovies(); }
    });
}

function applyFiltersAndRender() {
    let list = [...moviesState.all];
    const { search, filters, sort } = moviesState;

    if (search) list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    if (filters.yearFrom) list = list.filter(m => m.release_date && new Date(m.release_date).getFullYear() >= parseInt(filters.yearFrom));
    if (filters.yearTo) list = list.filter(m => m.release_date && new Date(m.release_date).getFullYear() <= parseInt(filters.yearTo));
    if (filters.minRating > 0) list = list.filter(m => (m.vote_average || 0) >= filters.minRating);
    if (filters.genres.length) list = list.filter(m => (m.genres || []).some(g => filters.genres.includes(g)));
    if (filters.language) list = list.filter(m => (m.original_language || 'en') === filters.language);

    const [field, dir] = sort.split('.');
    list.sort((a, b) => {
        let av, bv;
        if (field === 'release_date') { av = new Date(a.release_date || 0); bv = new Date(b.release_date || 0); }
        else { av = a.vote_average || 0; bv = b.vote_average || 0; } // popularity / vote_average / revenue all fall back to rating in demo data
        return dir === 'desc' ? (bv - av) : (av - bv);
    });

    moviesState.filtered = list;
    renderMovies();
}

function renderMovies() {
    const grid = document.getElementById('movieGrid');
    const noResults = document.getElementById('noResults');
    const countEl = document.getElementById('moviesCount');
    const { filtered, perPage } = moviesState;

    countEl.textContent = filtered.length;

    if (!filtered.length) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
        renderPagination();
        return;
    }
    noResults.classList.add('hidden');

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (moviesState.page > totalPages) moviesState.page = totalPages;
    const start = (moviesState.page - 1) * perPage;
    grid.innerHTML = filtered.slice(start, start + perPage).map(createMovieCard).join('');
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.max(1, Math.ceil(moviesState.filtered.length / moviesState.perPage));
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    prevBtn.disabled = moviesState.page <= 1;
    nextBtn.disabled = moviesState.page >= totalPages;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<div class="page-number ${i === moviesState.page ? 'active' : ''}" data-page="${i}">${i}</div>`;
    }
    pageNumbers.innerHTML = html;
    pageNumbers.querySelectorAll('.page-number').forEach(el => {
        el.addEventListener('click', () => {
            moviesState.page = parseInt(el.dataset.page);
            renderMovies();
        });
    });
}

document.addEventListener('DOMContentLoaded', initMoviesPage);
