const API_KEY = 'ce8cc57d5a729929765f42f9ebcfbc1c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

async function fetchMovies(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}`);
  const data = await response.json();
  return data.results;
}

// Load the Banner Image
async function loadBanner() {
  const movies = await fetchMovies('/trending/movie/day');
  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  const bannerElement = document.getElementById('banner');
  bannerElement.style.backgroundImage = `url(${IMAGE_URL}${randomMovie.backdrop_path})`;
}

// Load Movie List
async function loadMovieList() {
  const movies = await fetchMovies('/trending/movie/week');
  const movieListElement = document.getElementById('movie-list');
  
  movieListElement.innerHTML = ''; // Clear any previous content
  
  movies.forEach((movie) => {
    const movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');
    movieItem.innerHTML = `
      <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title}">
    `;
    
    movieListElement.appendChild(movieItem);
  });
}

// Initialize the app
function init() {
  loadBanner();
  loadMovieList();
}

// Run the app
init();
