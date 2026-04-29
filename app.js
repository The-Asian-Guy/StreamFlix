const API_KEY = 'ce8cc57d5a729929765f42f9ebcfbc1c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const categories = [
  { title: "Popular Movies", endpoint: "/movie/popular" },
  { title: "Top Rated", endpoint: "/movie/top_rated" },
  { title: "Now Playing", endpoint: "/movie/now_playing" }
];

let genresList = [];

/* ---------------- GENRES ---------------- */
function fetchGenres() {
  $.get(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`, data => {
    genresList = data.genres;
    genresList.forEach(g => {
      $('#genre-filter').append(`<option value="${g.id}">${g.name}</option>`);
    });
  });
}

/* ---------------- FAVORITES ---------------- */
function getFavorites() { return JSON.parse(localStorage.getItem('favorites')) || []; }
function isFavorite(id) { return getFavorites().includes(id); }
function toggleFavorite(id) {
  let favorites = getFavorites();
  if (favorites.includes(id)) favorites = favorites.filter(favId => favId !== id);
  else favorites.push(id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderFavorites();
}

/* ---------------- RENDER FAVORITES ---------------- */
function renderFavorites() {
  const favIds = getFavorites();
  const container = $('#favorites-list');
  container.empty();

  favIds.forEach(id => {
    $.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`, data => {
      container.append(`
        <div class="movie-item">
          <div class="poster-container">
            <img src="${IMAGE_URL}${data.poster_path}" class="movie-poster" data-id="${data.id}">
            <button class="fav-btn" data-id="${data.id}">❤️</button>
          </div>
          <h3>${data.title}</h3>
        </div>
      `);

      container.find('.fav-btn').last().click(() => toggleFavorite(data.id));
      container.find('.movie-poster').last().click(() => viewDetails(data.id));
    });
  });
}

/* ---------------- CREATE MOVIE ROW ---------------- */
function createMovieRow(title, movies) {
  const container = $('#movie-container');
  const row = $(`
    <section class="movie-row">
      <h2>${title}</h2>
      <button class="scroll-arrow left">&#10094;</button>
      <div class="movie-grid"></div>
      <button class="scroll-arrow right">&#10095;</button>
    </section>
  `);

  container.append(row);
  const grid = row.find('.movie-grid');
  const gridEl = grid[0];

  movies.forEach(movie => {
    if (!movie.poster_path) return;
    const isFav = isFavorite(movie.id);
    grid.append(`
      <div class="movie-item">
        <div class="poster-container">
          <img src="${IMAGE_URL}${movie.poster_path}" class="movie-poster" data-id="${movie.id}">
          <button class="fav-btn" data-id="${movie.id}">${isFav ? '❤️' : '🤍'}</button>
        </div>
        <h3>${movie.title}</h3>
      </div>
    `);
  });

  grid.find('.fav-btn').click(function () {
    const id = parseInt($(this).data('id'));
    toggleFavorite(id);
    $(this).text(isFavorite(id) ? '❤️' : '🤍');
  });

  grid.find('.movie-poster').click(function () {
    const id = $(this).data('id');
    viewDetails(id);
  });

  row.find('.left').click(() => gridEl.scrollBy({ left: -300, behavior: 'smooth' }));
  row.find('.right').click(() => gridEl.scrollBy({ left: 300, behavior: 'smooth' }));
}

/* ---------------- FETCH MOVIES ---------------- */
function fetchMovies(endpoint, title) {
  $.get(`${BASE_URL}${endpoint}?api_key=${API_KEY}`, data => {
    createMovieRow(title, data.results.slice(0, 10));
  });
}

/* ---------------- SEARCH ---------------- */
$('#search-bar').on('input', function () {
  const q = $(this).val();
  if (!q) return;
  $('#movie-container').empty();
  $.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}`, data => {
    createMovieRow("Search Results", data.results.slice(0, 10));
  });
});

/* ---------------- GENRE FILTER ---------------- */
$('#genre-filter').on('change', function () {
  const genre = $(this).val();
  $('#movie-container').empty();
  if (!genre) categories.forEach(c => fetchMovies(c.endpoint, c.title));
  else $.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre}`, data => {
    createMovieRow("Genre Results", data.results.slice(0, 10));
  });
});

/* ---------------- DETAILS / MODAL ---------------- */
function viewDetails(id) {
  $.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`, data => {
    $('#movie-details').html(`
      <img src="${IMAGE_URL}${data.poster_path}">
      <h2>${data.title}</h2>
      <p>${data.overview}</p>
      <p>⭐ ${data.vote_average}</p>
    `);
    $('#movie-modal').fadeIn();
  });
}
$('.close').click(() => $('#movie-modal').fadeOut());
$('#movie-modal').click(e => { if (e.target.id === 'movie-modal') $('#movie-modal').fadeOut(); });

/* ---------------- INIT ---------------- */
$(document).ready(() => {
  fetchGenres();
  categories.forEach(c => fetchMovies(c.endpoint, c.title));
  renderFavorites();
});
