const API_KEY = 'ce8cc57d5a729929765f42f9ebcfbc1c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const categories = [
  { title: "Popular Movies", endpoint: "/movie/popular" },
  { title: "Top Rated", endpoint: "/movie/top_rated" },
  { title: "Now Playing", endpoint: "/movie/now_playing" }
];

let genresList = [];

function fetchGenres() {
  $.ajax({
    url: `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
    method: 'GET',
    success: function (data) {
      genresList = data.genres;
      genresList.forEach(genre => {
        $('#genre-filter').append(`<option value="${genre.id}">${genre.name}</option>`);
        fetchMoviesByGenre(genre.id, genre.name);
      });
    }
  });
}

function createMovieRow(title, containerId, movies) {
  const container = $(`#${containerId}`);
  const row = $(`
    <section class="movie-row">
      <h2>${title}</h2>
      <button class="scroll-arrow scroll-left">&#10094;</button>
      <div class="movie-grid"></div>
      <button class="scroll-arrow scroll-right">&#10095;</button>
    </section>
  `);
  container.append(row);
  const grid = row.find('.movie-grid');

  movies.forEach(movie => {
    const isFavorite = JSON.parse(localStorage.getItem('favorites') || '[]').some(fav => fav.id === movie.id);
    const heartColor = isFavorite ? 'rgba(255,0,0,1)' : 'rgba(229,9,20,0.8)';

    const movieItem = $(`
      <div class="movie-item">
        <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <div class="movie-buttons">
          <button onclick="viewDetails(${movie.id})">Details</button>
          <button style="background-color: ${heartColor};" onclick='toggleFavorite(${JSON.stringify(movie)}, this)'>❤</button>
        </div>
      </div>
    `);
    grid.append(movieItem);
  });

  const gridEl = grid[0];

row.find('.scroll-left').on('click', function () {
  gridEl.scrollBy({
    left: -gridEl.clientWidth * 0.8,
    behavior: 'smooth'
  });
});

row.find('.scroll-right').on('click', function () {
  gridEl.scrollBy({
    left: gridEl.clientWidth * 0.8,
    behavior: 'smooth'
  });
});
}

function fetchMoviesRow(endpoint, title) {
  $.ajax({
    url: `${BASE_URL}${endpoint}?api_key=${API_KEY}&page=1`,
    method: 'GET',
    success: function (data) {
      createMovieRow(title, 'movie-container', data.results.slice(0, 10));
    }
  });
}

function fetchMoviesByGenre(genreId, genreName) {
  $.ajax({
    url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=1`,
    method: 'GET',
    success: function (data) {
      if (data.results.length > 0) createMovieRow(genreName, 'movie-container', data.results.slice(0, 10));
    }
  });
}

function toggleFavorite(movie, buttonElement) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const exists = favorites.some(fav => fav.id === movie.id);

  if (exists) {
    favorites = favorites.filter(fav => fav.id !== movie.id);
    buttonElement.style.backgroundColor = "rgba(229, 9, 20, 0.8)";
  } else {
    favorites.push(movie);
    buttonElement.style.backgroundColor = "rgba(255, 0, 0, 1)";
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderFavoritesRow();
}

function renderFavoritesRow() {
  $('#favorites-row').remove();
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favorites.length === 0) return;

  const container = $('#movie-container');
  const row = $(
    <section class="movie-row" id="favorites-row">
      <h2>My Favorites</h2>
      <button class="scroll-arrow scroll-left">&#10094;</button>
      <div class="movie-grid"></div>
      <button class="scroll-arrow scroll-right">&#10095;</button>
    </section>
  );
  container.prepend(row);
  const grid = row.find('.movie-grid');

  favorites.forEach(movie => {
    const movieItem = $(`
      <div class="movie-item">
        <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <div class="movie-buttons">
          <button onclick="viewDetails(${movie.id})">Details</button>
          <button style="background-color: rgba(255,0,0,1);" onclick='toggleFavorite(${JSON.stringify(movie)}, this)'>❤</button>
        </div>
      </div>
    `);
    grid.append(movieItem);
  });

  const gridEl = grid[0];

row.find('.scroll-left').on('click', function () {
  gridEl.scrollBy({
    left: -gridEl.clientWidth * 0.8,
    behavior: 'smooth'
  });
});

row.find('.scroll-right').on('click', function () {
  gridEl.scrollBy({
    left: gridEl.clientWidth * 0.8,
    behavior: 'smooth'
  });
});
}

function viewDetails(movieId) {
  $.ajax({
    url: `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits`,
    method: 'GET',
    success: function (data) {
      const detailsContainer = $('#movie-details');
      detailsContainer.empty();
      const castList = data.credits?.cast?.slice(0, 5).map(actor => `<li>${actor.name}</li>`).join('') || '<li>No cast info</li>';
      const movieDetails = `
        <img src="${IMAGE_URL}${data.poster_path}" alt="${data.title}">
        <div>
          <h2>${data.title}</h2>
          <p><strong>Overview:</strong> ${data.overview}</p>
          <p><strong>Release Date:</strong> ${data.release_date}</p>
          <p><strong>Rating:</strong> ${data.vote_average}</p>
          <h3>Cast:</h3>
          <ul>${castList}</ul>
        </div>
      `;
      detailsContainer.html(movieDetails);
      detailsContainer[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

$('#search-bar').on('input', function () {
  const query = $(this).val();
  if (!query) return;
  $('#movie-container').empty();
  $.ajax({
    url: `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=1`,
    method: 'GET',
    success: function(data) {
      createMovieRow(`Search Results: ${query}`, 'movie-container', data.results.slice(0, 10));
    }
  });
});

$('#genre-filter').on('change', function () {
  const genre = $(this).val();
  if (!genre) return;
  $('#movie-container').empty();
  const genreName = genresList.find(g => g.id == genre)?.name || "Genre";
  fetchMoviesByGenre(genre, genreName);
});

$(document).ready(function () {
  fetchGenres();
  categories.forEach(cat => fetchMoviesRow(cat.endpoint, cat.title));
  renderFavoritesRow();
});
