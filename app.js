const API_KEY = 'ce8cc57d5a729929765f42f9ebcfbc1c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const RESULTS_PER_PAGE = 5;

let currentPage = 1;
let currentMovies = [];
let totalPages = 1;

// Fetch genres for filter dropdown
function fetchGenres() {
  $.ajax({
    url: `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
    method: 'GET',
    success: function (data) {
      data.genres.forEach(genre => {
        $('#genre-filter').append(`<option value="${genre.id}">${genre.name}</option>`);
      });
    },
    error: function () {
      console.error('Failed to load genres');
    }
  });
}

// Fetch movies (search or discover)
function fetchMovies(query = '', genre = '') {
  const endpoint = query
    ? `/search/movie?query=${encodeURIComponent(query)}&page=1`
    : `/discover/movie?with_genres=${genre}&page=1`;

  $.ajax({
    url: `${BASE_URL}${endpoint}&api_key=${API_KEY}`,
    method: 'GET',
    success: function (data) {
      currentMovies = data.results;
      totalPages = Math.ceil(currentMovies.length / RESULTS_PER_PAGE);
      currentPage = 1;
      renderMovies();
      renderPagination();
    },
    error: function () {
      $('#movie-list').html('<p>Error loading movies!</p>');
    }
  });
}

// Render movies for the current page
function renderMovies() {
  const movieListElement = $('#movie-list');
  movieListElement.empty();

  const start = (currentPage - 1) * RESULTS_PER_PAGE;
  const end = start + RESULTS_PER_PAGE;
  const moviesToShow = currentMovies.slice(start, end);

  if (moviesToShow.length === 0) {
    movieListElement.html('<p>No movies found.</p>');
    return;
  }

  moviesToShow.forEach(movie => {
    const movieItem = $(`
      <div class="movie-item">
        <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <button onclick="viewDetails(${movie.id})">Details</button>
      </div>
    `);
    movieListElement.append(movieItem);
  });
}

// Render pagination with Prev/Next buttons
function renderPagination() {
  const paginationContainer = $('#pagination');
  paginationContainer.empty();
  if (totalPages <= 1) return;

  // Prev button
  const prevButton = $(`<button ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`);
  prevButton.click(() => changePage(currentPage - 1));
  paginationContainer.append(prevButton);

  // Show current ±2 pages
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = $(`<button ${i === currentPage ? 'disabled' : ''}>${i}</button>`);
    pageButton.click(() => changePage(i));
    paginationContainer.append(pageButton);
  }

  // Next button
  const nextButton = $(`<button ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`);
  nextButton.click(() => changePage(currentPage + 1));
  paginationContainer.append(nextButton);
}

// Change page and scroll to top
function changePage(pageNumber) {
  if (pageNumber < 1 || pageNumber > totalPages) return;
  currentPage = pageNumber;
  renderMovies();
  renderPagination();
  scrollToTopOfMovies();
}

// Smooth scroll to top of movie list
function scrollToTopOfMovies() {
  const movieList = document.getElementById('movie-list');
  if (movieList) {
    movieList.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Fetch popular movies
function fetchPopularMovies() {
  $.ajax({
    url: `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`,
    method: 'GET',
    success: function (data) {
      const movieListElement = $('#popular-movie-list');
      movieListElement.empty();

      const moviesToShow = data.results.slice(0, RESULTS_PER_PAGE);
      moviesToShow.forEach(movie => {
        const movieItem = $(`
          <div class="movie-item">
            <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
          </div>
        `);
        movieListElement.append(movieItem);
      });
    },
    error: function () {
      $('#popular-movie-list').html('<p>Error loading popular movies!</p>');
    }
  });
}

// View movie details
function viewDetails(movieId) {
  $.ajax({
    url: `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits`,
    method: 'GET',
    success: function (data) {
      const detailsContainer = $('#movie-details');
      detailsContainer.empty();

      const castList = data.credits?.cast?.slice(0, 5).map(actor => `<li>${actor.name}</li>`).join('') || '<li>No cast info</li>';

      const movieDetails = `
        <h2>${data.title}</h2>
        <img src="${IMAGE_URL}${data.poster_path}" alt="${data.title}">
        <p><strong>Overview:</strong> ${data.overview}</p>
        <p><strong>Release Date:</strong> ${data.release_date}</p>
        <p><strong>Rating:</strong> ${data.vote_average}</p>
        <h3>Cast:</h3>
        <ul>${castList}</ul>
      `;
      detailsContainer.html(movieDetails);
    },
    error: function () {
      $('#movie-details').html('<p>Error loading movie details.</p>');
    }
  });
}

// Add movie to localStorage favorites
function addToFavorites(movie) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(fav => fav.id === movie.id)) {
    favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

// Event listeners
$('#search-bar').on('input', function () {
  const query = $(this).val();
  fetchMovies(query, $('#genre-filter').val());
});

$('#genre-filter').on('change', function () {
  const genre = $(this).val();
  fetchMovies($('#search-bar').val(), genre);
});

// Initialize app
$(document).ready(function () {
  fetchGenres();
  fetchMovies();
  fetchPopularMovies();
});
