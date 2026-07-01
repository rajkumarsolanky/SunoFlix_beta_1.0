
// Constants
const API_KEY = 'your_api_key_here';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/original';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize features based on current page
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('index.html')) {
        initializeHomePage();
    } else if (currentPage.includes('movies.html')) {
        initializeMoviesPage();
    } else if (currentPage.includes('movie-detail.html')) {
        initializeMovieDetailPage();
    } else if (currentPage.includes('profile.html')) {
        initializeProfilePage();
    }
});

// Home Page Initialization
function initializeHomePage() {
    loadFeaturedMovies();
    loadLatestReleases();
    setupCarousel();
}

// API Calls
async function fetchMovies(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}?api_key=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movies:', error);
        showError('Failed to fetch movies. Please try again later.');
        return null;
    }
}

// UI Components
function createMovieCard(movie) {
    return `
        <div class="movie-card" data-id="${movie.id}">
            <img src="${IMG_BASE_URL}${movie.poster_path}" 
                 alt="${movie.title}" 
                 loading="lazy">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-meta">
                    <span class="rating">
                        <i class="fas fa-star"></i>
                        ${movie.vote_average.toFixed(1)}
                    </span>
                    <span class="year">
                        ${new Date(movie.release_date).getFullYear()}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Event Handlers
function setupCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;

    const prevBtn = document.querySelector('.carousel-button.prev');
    const nextBtn = document.querySelector('.carousel-button.next');
    
    let scrollPosition = 0;
    const scrollAmount = 300;

    nextBtn?.addEventListener('click', () => {
        scrollPosition += scrollAmount;
        carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    });

    prevBtn?.addEventListener('click', () => {
        scrollPosition -= scrollAmount;
        if (scrollPosition < 0) scrollPosition = 0;
        carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    });
}

// Utility Functions
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

function showError(message) {
    // Implementation for showing error messages
    console.error(message);
}

// Initialize Movies Page
function initializeMoviesPage() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortBy');
    let currentPage = 1;
    
    searchInput?.addEventListener('input', debounce(handleSearch, 500));
    sortSelect?.addEventListener('change', handleSort);
    
    loadMovies(currentPage);
}

// Debounce Utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createMovieCard,
        showLoading,
        hideLoading
    };
}
