import { parameters } from './parameters.js';

// HTML elements
let tableBody = document.getElementById("tableBody");
let clip = document.getElementById("clip");
let movieInput = document.getElementById("movieName");

// Data structures
let movies = [];

let API_KEY = parameters.IMDB_API_KEY;
let SCRIPT_URL = parameters.SCRIPT_URL;

console.log(SCRIPT_URL)

let fetchMovie = async (e) => {
    e.preventDefault();

    let expression = movieInput.value;

    // Obtener listado de peliculas con ese nombre
    const rawMovieListResponse = await fetch(`https://imdb-api.com/en/API/SearchMovie/${API_KEY}/${expression}`)
    const movieList = await rawMovieListResponse.json();

    // Obtener la informacion para esa lista de resultados
    movieList.results.forEach(async (m) => {
        const rawMovieInformationResponse = await fetch(`https://imdb-api.com/en/API/Title/${API_KEY}/${m.id}/Ratings,`)
        const movieInfo = await rawMovieInformationResponse.json();

        // Construir objeto para agregar a la lista de peliculas
        movies.push({
            "id":movieInfo.id,
            "Nombre": movieInfo.title,
            "Duracion": movieInfo.runtimeMins,
            "Year": movieInfo.year,
            "Rating": movieInfo.imDbRating,
        });
        
        tableBody.innerHTML += `
            <tr>
                <form>
                    <td>${movieInfo.title}</td>
                    <td>${movieInfo.runtimeMins}</td>
                    <td>${movieInfo.year}</td>
                    <td>${movieInfo.imDbRating}</td>
                    <td> <button class="btn btn-primary gs" id="${movieInfo.id}">Enviar</button></td>
                </form>
            </tr>
        `

    });


    // Emprolijar interfaz
    movieInput.value = "";

}

let googleSheetsSubmit = (btn) => {
    // Obtener la pelicula seleccionada del array en memoria
    let movie = movies.find(m => m.id == btn.id);

    // En caso de que en algun futuro quiera cambiar los campos de la hoja de calculo
    let formData = new FormData();
        
    formData.append('Nombre', movie.Nombre);
    formData.append('Duracion', movie.Duracion);
    formData.append('Year', movie.Year);
    formData.append('Rating', movie.Rating);

    // Enviar datos a la hoja de calculo
    fetch(SCRIPT_URL, { method: 'POST', body: formData })
        .then(r => btn.style.backgroundColor = 'green')
        .catch(e => {
            btn.style.backgroundColor = 'red';
            console.error(e);
        })

}


// Event listeners
clip.addEventListener('click', fetchMovie);
document.querySelector('body').addEventListener('click', (e) => {
    if (e.target.classList == "btn btn-primary gs") {
        googleSheetsSubmit(e.target);
    }
})