//1:Get data with a basic Api request from the pokemon API.
getData();
function getData(url) {
  fetch("https://pokeapi.co/api/v2/pokemon/")
    .then((res) => res.json())

    .then((data) => console.log(data));
}

//2.Display the Api data on the webpage
// Display functions:

function display(string) {
  mainElement.innerHTML = string;
}

// view pokemon index
function viewPokemonIndex(pokemons) {
  let pokemonList = pokemons.results
    .map((pokemon) => {
      return viewCardSmall(pokemon);
    })
    .join("");
  return `
  <div class="poke-list">
    ${pokemonList}
  </div>`;
}

// view a small pokemon card
function viewCardSmall(pokemon, dataDetails) {
  //const pokemonData = {sprites: {front_default: "#"}}
  return `
  <div class="card" id="${pokemon.url}">
      <h3>${pokemon.name}</h3>
      <img src="${dataDetails.sprites.front_default}"/>
  </div>`;
}

// view a detailed pokemon card:
function viewCardBig({
  id,
  name,
  sprites,
  height,
  weight,
  base_experience,
  types,
  stats,
}) {
  const pokemonTypes = types
    .map(({ type }) => `<h3>${type.name}</h3>`)
    .join("");

  const pokemonStats = stats
    .map(
      ({ stat, base_stat, effort }) =>
        `<h3>${stat.name}</h3><h3>${base_stat}</h3><h3>${effort}</h3><hr>`
    )
    .join("");

  return `
  <div class="card-big">
        <h2>${id}. ${name}</h2>
        <img src="${sprites.front_default}" alt="">

        <div class="card-stats">
            <div class="info">
                <h3 class="height">${height / 10}m</h3>
                <h3 class="weight">${weight / 10}kg</h3>
                <h3 class="xp">${base_experience}xp</h3>
            </div>
            <div class="types">
                ${pokemonTypes}
            </div>
            <div class="stats">
                ${pokemonStats}
            </div>
        </div>
    </div>`;
}
async function displayData(url = "https://pokeapi.co/api/v2/pokemon/") {
  const apiData = await getApi(url);
  pokemonData = apiData;
  if (pokemonData.previous == null)
    pokemonData.previous = `https://pokeapi.co/api/v2/pokemon/?offset=${pokemonData.count}&limit=20`;
  if (pokemonData.next == null)
    pokemonData.next = "https://pokeapi.co/api/v2/pokemon/";

  let pokemonHtml = "";
  for (const pokemon of pokemonData.results) {
    let pokemonDetails = await getApi(pokemon.url);
    pokemonHtml += viewCardSmall(pokemon, pokemonDetails);
  }

  display(pokemonHtml);
  //3:Add some basic interaction events. (example: click a button to display more data.)
  // add events to pokemon cards
  const pokemonCardElements = document.querySelectorAll(".card");
  pokemonCardElements.forEach((card) => {
    card.addEventListener("click", async (event) => {
      if (event.target.id) {
        const pokemonDetails = await getApi(event.target.id);
        display(viewCardBig(pokemonDetails));
      } else {
        const pokemonDetails = await getApi(event.target.parentElement.id);
        render(viewCardBig(pokemonDetails));
      }
    });
  });
}

// on page load run displaydata:
displayData();

async function getApi(url) {
  const request = await fetch(url);
  const data = await request.json();
  return data;
}

const mainElement = document.getElementById("main");
// navbar events:
const buttonHome = document.getElementById("button-home");
buttonHome.addEventListener("click", () => displayData());

const buttonNext = document.getElementById("button-next");
buttonNext.addEventListener("click", (event) => {
  displayData(pokemonData.next);
});

const buttonPrev = document.getElementById("button-prev");
buttonPrev.addEventListener("click", (event) => {
  if (pokemonData.previous) displayData(pokemonData.previous);
  else displayData();
});

const searchPokemon = document.getElementById("search-text");
searchPokemon.addEventListener("input", (event) => {
  //console.log(event.target.value)
  getApi(
    "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=" + pokemonData.count,
    (data) => {
      const searchResults = {
        results: [
          data.results.find((pokemon) => pokemon.name == event.target.value),
        ],
      };
      if (searchResults.results[0]) display(viewPokemonIndex(searchResults));
    }
  );
});
