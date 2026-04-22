const API_KEY = 'ce8cc57d5a729929765f42f9ebcfbc1c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
// TMDB OAuth 2.0 flow for login
const LOGIN_URL = 'https://www.themoviedb.org/authenticate/';
const CALLBACK_URL = 'http://localhost/callback'; // Replace with your deployed callback URL

function login() {
  window.location.href = `${LOGIN_URL}${API_KEY}`;
}

function handleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestToken = urlParams.get('request_token');

  if (requestToken) {
    // Exchange request token for session
    $.ajax({
      url: `${BASE_URL}/authentication/session/new`,
      method: 'POST',
      data: { api_key: API_KEY, request_token: requestToken },
      success: function (data) {
        localStorage.setItem('session_id', data.session_id);
        alert('Logged in successfully!');
      }
    });
  }
}
// Check if the user is logged in
if (localStorage.getItem('session_id')) {
  $('#login-btn').text('Logout').on('click', function () {
    localStorage.removeItem('session_id');
    alert('Logged out');
    location.reload();
  });
}
// Add movie to favorites
function addToFavorites(movie) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.push(movie);
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Remove movie from favorites
function removeFromFavorites(movieId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter((movie) => movie.id !== movieId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
}
$(document).ready(function () {
  // Function to fetch data from TMDB API
  function fetchMovies(endpoint) {
    return $.ajax({
      url: `${BASE_URL}${endpoint}&api_key=${API_KEY}`,
      method: 'GET',
      dataType: 'json'
    });
  }
function showLoadingIndicator() {
  $('#movie-list').html('<p>Loading...</p>');
}

function handleError(error) {
  $('#movie-list').html('<p>Something went wrong. Please try again later.</p>');
}

// Example usage with AJAX
function fetchMovies(endpoint) {
  showLoadingIndicator();
  $.ajax({
    url: `${BASE_URL}${endpoint}&api_key=${API_KEY}`,
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      // Handle successful data fetching
    },
    error: function (error) {
      handleError(error);
    }
  });
}
  // Load Banner Image
  function loadBanner() {
    fetchMovies('/trending/movie/day').done((data) => {
      const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
      $('#banner').css('background-image', `url(${IMAGE_URL}${randomMovie.backdrop_path})`);
    });
  }

  // Load Movie List
  function loadMovieList() {
    fetchMovies('/trending/movie/week').done((data) => {
      const movieListElement = $('#movie-list');
      movieListElement.empty(); // Clear existing movies

      data.results.forEach((movie) => {
        const movieItem = $('<div>').addClass('movie-item').html(`
          <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
        `);
        movieListElement.append(movieItem);
      });
    });
  }

  // Handle Navigation for different sections
  $('nav a').on('click', function (e) {
    e.preventDefault();
    const section = $(this).text().toLowerCase();
    if (section === 'home') {
      loadBanner();
      loadMovieList();
    } else {
      // Placeholder for future sections
      $('#movie-list').html('<p>Coming soon...</p>');
    }
  });

  // Initialize the app
  loadBanner();
  loadMovieList();
});
