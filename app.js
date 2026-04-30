const API_KEY = 'ce8cc57d5a729929765f42f9ebcfbc1c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const categories = [
  { title: "Popular Movies", endpoint: "/movie/popular" },
  { title: "Top Rated", endpoint: "/movie/top_rated" },
  { title: "Now Playing", endpoint: "/movie/now_playing" }
];

let genresList = [];
let isModalLoading = false;
let favoritesVisible = true;

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

/* ---------------- GENERIC ROW CREATOR ---------------- */
function createMovieRow({ title, movies, container = '#movie-container', hideArrows = false, hearts = true }) {
  const row = $(`
    <section class="movie-row">
      <h2>${title}</h2>
      <button class="scroll-arrow left">&#10094;</button>
      <div class="movie-grid"></div>
      <button class="scroll-arrow right">&#10095;</button>
    </section>
  `);

  $(container).append(row);
  const grid = row.find('.movie-grid')[0];

  if (hideArrows) row.find('.scroll-arrow').hide();

  movies.forEach(movie => {
    if (!movie.poster_path) return;
    const favHeart = hearts ? (isFavorite(movie.id) ? '❤️' : '🤍') : '';
    const heartButton = hearts ? `<button class="fav-btn" data-id="${movie.id}">${favHeart}</button>` : '';

    row.find('.movie-grid').append(`
      <div class="movie-item">
        <div class="poster-container">
          <img src="${IMAGE_URL}${movie.poster_path}" class="movie-poster" data-id="${movie.id}">
          ${heartButton}
        </div>
        <h3>${movie.title}</h3>
      </div>
    `);
  });

  row.find('.movie-poster').click(function () { viewDetails($(this).data('id')); });

  row.find('.fav-btn').click(function () {
    const id = $(this).data('id');
    toggleFavorite(id);
    $(this).text(isFavorite(id) ? '❤️' : '🤍');
  });

  row.find('.left').click(() => grid.scrollBy({ left: -300, behavior: 'smooth' }));
  row.find('.right').click(() => grid.scrollBy({ left: 300, behavior: 'smooth' }));

  return row;
}

/* ---------------- RENDER FAVORITES ---------------- */
function renderFavorites() {
  const favIds = getFavorites();
  const container = $('#favorites-container');
  container.empty();

  if (favIds.length === 0) return;

  const requests = favIds.map(id => $.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`));
  $.when(...requests).done((...results) => {
    const movies = results.map(r => r[0] || r);
    createMovieRow({ title: "Favorites", movies, container: '#favorites-container', hearts: true });
    if (!favoritesVisible) $('#favorites-container').hide();
  });
}

/* ---------------- FETCH MOVIES ---------------- */
function fetchMovies(endpoint, title) {
  $.get(`${BASE_URL}${endpoint}?api_key=${API_KEY}`, data => {
    createMovieRow({ title, movies: data.results.slice(0, 10) });
  });
}

/* ---------------- SEARCH ---------------- */
$('#search-bar').on('input', function () {
  const q = $(this).val();
  $('#movie-container').empty();

  if (!q) {
    if (favoritesVisible) $('#favorites-container').show();
    categories.forEach(c => fetchMovies(c.endpoint, c.title));
    return;
  }

  $('#favorites-container').hide();
  $.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}`, data => {
    createMovieRow({ title: "Search Results", movies: data.results.slice(0, 10) });
  });
});

/* ---------------- GENRE FILTER ---------------- */
$('#genre-filter').on('change', function () {
  const genreId = $(this).val();
  $('#movie-container').empty();

  if (!genreId) {
    if (favoritesVisible) $('#favorites-container').show();
    categories.forEach(c => fetchMovies(c.endpoint, c.title));
    return;
  }

  $('#favorites-container').hide();
  const genreName = genresList.find(g => g.id == genreId)?.name || "Genre Results";
  $.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`, data => {
    createMovieRow({ title: genreName, movies: data.results.slice(0, 10) });
  });
});

/* ---------------- DETAILS ---------------- */
function viewDetails(id) {
  if (isModalLoading) return;
  isModalLoading = true;

  $('#movie-details').html('');
  $('#movie-modal').hide();

  $.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`)
    .done(data => {
      if (!data || !data.title) return;
      $('#movie-details').html(`
        <img src="${IMAGE_URL}${data.poster_path}" alt="${data.title}">
        <h2>${data.title}</h2>
        <p>${data.overview}</p>
        <p>⭐ ${data.vote_average}</p>
        <p>Release: ${data.release_date}</p>
      `);
      $('#movie-modal').fadeIn();
    })
    .fail(err => console.error(err))
    .always(() => { isModalLoading = false; });
}

/* ---------------- CLOSE MODAL ---------------- */
$('.close').click(() => $('#movie-modal').fadeOut());
$('#movie-modal').click(e => { if (e.target.id === 'movie-modal') $('#movie-modal').fadeOut(); });

/* ---------------- TOGGLE FAVORITES ---------------- */
$('#toggle-favorites-btn').click(() => {
  favoritesVisible = !favoritesVisible;
  if (favoritesVisible) {
    $('#favorites-container').show();
    $('#toggle-favorites-btn').text('Hide Favorites');
  } else {
    $('#favorites-container').hide();
    $('#toggle-favorites-btn').text('Show Favorites');
  }
});

/* ---------------- INIT ---------------- */
$(document).ready(() => {
  $('#movie-modal').hide(); // prevent empty modal flash
  fetchGenres();
  categories.forEach(c => fetchMovies(c.endpoint, c.title));
  renderFavorites();
});
