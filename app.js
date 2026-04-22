const API_KEY = 'ce8cc57d5a729929765f42f9ebcfbc1c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
let currentPage = 1;

// Fetch genres for the filter
function fetchGenres() {
  $.ajax({
    url: `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
    method: 'GET',
    success: function (data) {
      const genres = data.genres;
      genres.forEach((genre) => {
        $('#genre-filter').append(`<option value="${genre.id}">${genre.name}</option>`);
      });
    }
  });
}

// Fetch movies based on search query
function fetchMovies(query = '', genre = '') {
  const endpoint = query 
    ? `/search/movie?query=${query}&page=${currentPage}` 
    : `/discover/movie?page=${currentPage}&with_genres=${genre}`;

  $.ajax({
    url: `${BASE_URL}${endpoint}&api_key=${API_KEY}`,
    method: 'GET',
    success: function (data) {
      renderMovies(data.results);
      renderPagination(data.total_pages); // Render pagination based on total pages
    },
    error: function () {
      $('#movie-list').html('<p>Error loading movies!</p>');
    }
  });
}

// Render the movie list dynamically
function renderMovies(movies) {
  const movieListElement = $('#movie-list');
  movieListElement.empty();

  movies.forEach((movie) => {
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

// Render Pagination
function renderPagination(totalPages) {
  const paginationContainer = $('#pagination');
  paginationContainer.empty();
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = `<button onclick="changePage(${i})">${i}</button>`;
    paginationContainer.append(pageButton);
  }
}

// Change Page
function changePage(pageNumber) {
  currentPage = pageNumber;
  fetchMovies($('#search-bar').val(), $('#genre-filter').val());
}

// Fetch popular movies
function fetchPopularMovies() {
  $.ajax({
    url: `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
    method: 'GET',
    success: function (data) {
      const movieListElement = $('#popular-movie-list');
      movieListElement.empty();
      
      data.results.forEach((movie) => {
        const movieItem = $(`
          <div class="movie-item">
            <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
          </div>
        `);
        movieListElement.append(movieItem);
      });
    }
  });
}

// View Details of a Movie
function viewDetails(movieId) {
  $.ajax({
    url: `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`,
    method: 'GET',
    success: function (data) {
      const detailsContainer = $('#movie-details');
      detailsContainer.empty();

      const movieDetails = `
        <h2>${data.title}</h2>
        <img src="${IMAGE_URL}${data.poster_path}" alt="${data.title}">
        <p><strong>Overview:</strong> ${data.overview}</p>
        <p><strong>Release Date:</strong> ${data.release_date}</p>
        <p><strong>Rating:</strong> ${data.vote_average}</p>
        <h3>Cast:</h3>
        <ul>
          ${data.cast.map((actor) => `<li>${actor.name}</li>`).join('')}
        </ul>
      `;
      detailsContainer.html(movieDetails);
    }
  });
}

// Add movie to localStorage Favorites
function addToFavorites(movie) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some((fav) => fav.id === movie.id)) {
    favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

// Search Input Event
$('#search-bar').on('input', function () {
  const query = $(this).val();
  fetchMovies(query);
});

// Genre Filter Event
$('#genre-filter').on('change', function () {
  const genre = $(this).val();
  fetchMovies('', genre);
});

// Initialize
$(document).ready(function () {
  fetchGenres(); // Populate genre filter dropdown
  fetchMovies();  // Fetch movies when the app loads
  fetchPopularMovies();  // Fetch popular movies
});
