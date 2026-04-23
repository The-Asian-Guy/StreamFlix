const API_KEY = 'ce8cc57d5a729929765f42f9ebcfbc1c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// Categories for Netflix-style rows
const categories = [
  { title: "Popular Movies", endpoint: "/movie/popular" },
  { title: "Top Rated", endpoint: "/movie/top_rated" },
  { title: "Now Playing", endpoint: "/movie/now_playing" }
];

// Fetch genres for filters
function fetchGenres() {
  $.ajax({
    url: `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
    method: 'GET',
    success: function (data) {
      data.genres.forEach(genre => {
        $('#genre-filter').append(`<option value="${genre.id}">${genre.name}</option>`);
      });
    }
  });
}

// Create a row dynamically
function createMovieRow(title, containerId, movies) {
  const container = $(`#${containerId}`);
  const row = $(`
    <section class="movie-row">
      <h2>${title}</h2>
      <div class="movie-grid"></div>
    </section>
  `);
  container.append(row);
  const grid = row.find('.movie-grid');

  movies.forEach(movie => {
    const movieItem = $(`
      <div class="movie-item">
        <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <button onclick="viewDetails(${movie.id})">Details</button>
      </div>
    `);
    grid.append(movieItem);
  });
}

// Fetch movies for a row
function fetchMoviesRow(endpoint, containerId, title) {
  $.ajax({
    url: `${BASE_URL}${endpoint}?api_key=${API_KEY}&page=1`,
    method: 'GET',
    success: function (data) {
      createMovieRow(title, containerId, data.results.slice(0, 10)); // Show top 10
    }
  });
}

// Initialize Netflix-style rows
function initNetflixRows() {
  const mainContainer = $('#movie-container');
  categories.forEach(category => {
    fetchMoviesRow(category.endpoint, 'movie-container', category.title);
  });
}

// View Movie Details
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
      detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Initialize
$(document).ready(function () {
  fetchGenres();
  initNetflixRows();
});
