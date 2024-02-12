
const mainContainer = document.querySelector(".content-grid");
const searchBarForm = document.querySelector(".search-container");
const searchBar = document.querySelector(".search-bar");

async function getMovie(url)
{
   const responseObj = await fetch(url);
   const data = await responseObj.json();
   return data; // this takes the form of an object containing several other objects that represent the top trending movies, or an object with data representing
}              // a specific movie.

function createElements(data) 
{
   const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
   const fragment = document.createDocumentFragment();

   data.results.forEach(element => 
   {
      const movieContainer = document.createElement('div');
      movieContainer.setAttribute('class', 'movie-container');

      const posterContainer = document.createElement('div');
      posterContainer.setAttribute('class', 'poster-container');

      const posterImage = document.createElement('img');
      posterImage.setAttribute('class', 'movie-poster');
      // IMG_PATH is the main URL that the API gets its images, and .poster_path contains the exact file path for a movies' poster:
      posterImage.src = IMG_PATH + element.poster_path; 

      const movieInfo = document.createElement('div');
      movieInfo.setAttribute('class', 'movie-info-container');
      movieInfo.innerHTML = `${element.original_title}`;

      posterContainer.appendChild(posterImage);
      movieContainer.appendChild(posterContainer);
      movieContainer.appendChild(movieInfo);

      fragment.appendChild(movieContainer);
   });

   mainContainer.innerHTML = ''; 
   mainContainer.appendChild(fragment);
}

async function populateMain() 
{  
   document.title="Home";
   const urlTrending = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&api_key=cd2088a09a0263d493c9587c229ec168';

   const data = await getMovie(urlTrending);
   createElements(data);
}

async function populateSearch(query) 
{  
   document.title = query;
   //replace(/\s/g, '+'); replaces spaces with the "+" character
   const url = 'https://api.themoviedb.org/3/search/movie?api_key=cd2088a09a0263d493c9587c229ec168&query=' + query.replace(/\s/g, '+');
   const data = await getMovie(url);
   createElements(data);
}

// Returns a query string from the windows URL:

function getQueryParameter() 
{  
   // Here we are calling a URLSearchParams constructor, in order to return a URLSearchParams object.
   // We pass the constructor "window.location.search", which returns the URL for the windows' search bar.
   // When we call urlParams.get('query'), we are telling the URLSearchParams object that we want to return the 'query' parameter of the URL
   // we saved in it.

   const urlParams = new URLSearchParams(window.location.search);
   return urlParams.get('query');

}

// This is what loads everything now. If there is a search query, the query is used to create the page, else it loads
// the trending content via populateMain; it is the only thing that gets called from the script on start-up.

// Breakdown of what's happening:

/*
   1. We add a new event listener to the window. The event in question is called 'DOMContentLoaded' , and it executes as soon as the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, images, and async scripts to finish loading.

   In otherwords, it instantly lunches as soon as index.html is loaded and parsed.

   2. The second parameter of the .addEventListener() method accepts a function. 
      In this case, () => { ... }is defining an anonymous function (ie doesn't have a name.).

   3. Then in the body of this function we are calling the getQueryParameter function so that we can retrieve the queryString from the current URL.
      If we have one, we pass it to populateSearch() so that we can use it load the page with the search result content.
      
      Else, we load the trending info. from the API.

*/

window.addEventListener('DOMContentLoaded', () => 
{
   const query = getQueryParameter();

   if (query) 
   {
      populateSearch(query);
      const url = `?query=${query.replace(/\s/g, '+')}`;//replaces whitespace characters with "+"
      history.replaceState({ page: 'search', query: query }, null, url);
      

   }
   else 
   {
      populateMain();
   }
});


//Breakdown:

// The first parameter is the name of the event, and (eventObject) is the event object automatically created by the browser when the form is submitted.
// It provides info. about the event and various properties and methods included in the object.

// It is automatically created when we create the function parameter in the addEventListener method.

// The purpose of declaring the event object here is to stop the default behavior associated with the event;
// in this case, preventing the form from submitting and triggering a page reload.

// In the body of the function:

/*

Aside from preventing the default form submission behavior, the function of the event listener extracts the value saved into the 
search bar DOM object we created earlier.

This object will hold the name of the movie the user is searching for, which we pass to the populateSearch() function so that it can use it to
retrieve the movie information from the API and load it into the HTML file.

In addition to this, we create an entry to the browser session's history stack(not an actual stack, but a stack like structure), which allows us to change the URL of the current page without reloading the page. 

So when we save a "state" , we save the current URL of the browser and save it in a stack.

The pushState method takes three arguments: a State object, a tittle(which is ignored by most browsers), and a URL. 

The state object can contain any information you find relevant to represent the current state of your application. 
The "page" property tells the browser what the current purpose of the page is, and the query property is just saving the search query entered by the user 
into the State object. 

This information saved in the State object helps us go back and forward in the history stack, and come in hand when being used in a popState event. 

*/

searchBarForm.addEventListener("submit", (eventObject) => 
{
   eventObject.preventDefault();

   const query = searchBar.value.trim(); // .trim() removes whitespace. 

   if (query) 
   {
      populateSearch(query);
      const url = `?query=${query.replace(/\s/g, '+')}`;//replaces whitespace characters with "+"
      history.pushState({ page: 'search', query: query }, null, url);
      searchBar.value = "";
      
   }

});

/*
   Breakdown:

   A popstate event occurs when the window's history change's. When this occurs, the browser creates a PopStateEvent, which we creates
   an instance of and call it "event." 

   This event can hold information about a pages' state, which we can extract in order to know what to load into a new page when the user changes
   the window's hisotory within our page. 

   If the browser doesn't have any states(because they haven't search anything in our pages search bar) or if we have a state that doens't have a page value,
   we load the trending content.

   Otherwise we check whether the state has the values we expect, and if they do, we take the user search query and use it to load a search page with the
   respective results. 

*/

window.addEventListener('popstate', (event) => 
{
   const state = event.state; //returns the information provided to .pushState()

   if (!state || !state.page) 
   {
      populateMain();

   } 
   else if (state.page == 'search' && state.query) 
   {  
      populateSearch(state.query);
   }
});

// note: I'm able to dynamically change the title of each page, but the names of the previous pages when I hold the browser's back button display the
// name of the current page, not the name they had prior to pushing a new state. 

// However, they update with the correct info. when I go back to the previous page.