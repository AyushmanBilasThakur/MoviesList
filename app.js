const movieCardsHolder = document.getElementsByClassName("card-container")[0]
const movieOverviewHolder = document.getElementsByClassName("movie-container")[0]
const body = document.getElementsByClassName("body")[0]

const header = document.querySelector("header");

const heading = document.getElementById("heading");
const searchButton = document.getElementById("search-button")
const searchText = document.getElementById("search-text")

const BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = "f159f687d498f2b970da3bf8874e41fc"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"


let currentPage = 1

let movieList = []

let currentMoviesList = []
let showingMovie = false
let canLoad = true

async function searchMovie () {
    if(searchText.value == "")
        return;

    if ('URLSearchParams' in window) {
        var searchParams = new URLSearchParams();
        searchParams.set("search", searchText.value);
        window.location.search = searchParams.toString();
    }
}

searchText.addEventListener("keypress", (e) => {
    if(e.key == "Enter"){
        searchMovie();
    }
})

searchButton.addEventListener("click", searchMovie)

async function requestAPI () {

    console.log(currentPage);
    let search = new URLSearchParams(window.location.search);
    let genre = search.get("genre")
    let searchedMovie = search.get("search");
    let result;
    
    if(searchedMovie != null){
        result = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&page=${currentPage}&query=${searchedMovie}`)
        heading.innerText = `Search result for - ${searchedMovie}`
    }
    else if(genre!= null)
        result = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${currentPage}&with_genres=${genre}`)
    else 
        result = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${currentPage}`)

    result = await result.json();
    currentMoviesList = [...currentMoviesList,...result.results];

    if(currentMoviesList.length == movieList.length){
        canLoad = false;
    }


    movieList = currentMoviesList;
    renderMovies();
}

async function fetchMovieData(movie_id) {
    
    let result = await fetch(`${BASE_URL}/movie/${movie_id}?api_key=${API_KEY}&page=${currentPage}`)
    result = await result.json();
    return result;
}

function return_poster_path(path){
    if(path != null)
        return `${IMAGE_BASE_URL}/${path}`
    return "/poster.jpeg"
}

function return_banner_path(path){
    if(path != null)
        return `${IMAGE_BASE_URL}/${path}`
    return "/banner.jpeg"
}

function renderMovies () {

    movieCardsHolder.innerHTML = ``

    if(currentMoviesList.length == 0 && !showingMovie) {
        movieCardsHolder.innerHTML = `No such movie found`
    }

    currentMoviesList.forEach(movie => {
        movieCardsHolder.innerHTML += `
            <div class="card" onclick="showmovie(${movie.id})">
                <div class="img">
                    <img src="${return_poster_path(movie.poster_path)}">
                </div>
                <h3>${movie.title} - ${movie.release_date ? movie.release_date.split("-")[0]: 0000}</h3>
                <p class="movie-rating">⭐️${movie.vote_average}</p>
            </div>
        `
    })
}


function hideMovie() {
    heading.innerText = "The Ultimate Movie List";
    currentMoviesList = movieList;
    header.style.display = "block";
    body.style.padding = "40px";
    movieOverviewHolder.innerHTML = '';
    showingMovie = false
    renderMovies();
}

async function showmovie(movie_id) {
    header.style.display = "none"
    body.style.padding = "0px"

    let movie = await fetchMovieData(movie_id);
    showingMovie = true;
    movieOverviewHolder.innerHTML = `
        <img class="banner" src="${return_banner_path(movie.backdrop_path)}">

        <div class="movie-header">
            <img class="poster" src="${return_poster_path(movie.poster_path)}">
            <h1>
                ${movie.title}
                - 
                (${movie.release_date.split("-")[0]})

                <span class="rating">⭐️${movie.vote_average}</span>
            </h1>
        </div>

        <div class="movie-body">
            <p>${movie.overview}</p>
            <br>
            <br>

            <p><strong>Release date:</strong> ${movie.release_date}</p>
            <br>
            <p><strong>Produced by:</strong> ${movie.production_companies.map(e => e.name).join(", ")}</p>

            <br>

            <p><strong>Genres:</strong> 
                ${movie.genres.map(e => `<a href="/?genre=${e.id}">${e.name}</a>`).join(", ")}
            
            </p>


            <br>

            <button class="return-to-list" onclick="hideMovie()">Return To List</button>
        </div>

    `



    currentMoviesList = [];
    renderMovies();
}


requestAPI();


  let observer = new IntersectionObserver((entries, obeserver) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && canLoad && !showingMovie) {
            currentPage += 1;
            requestAPI();
        }
    })
}, {
});

let target = document.querySelector('footer');
observer.observe(target);