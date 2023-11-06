import * as model from './model.js';
import recipeView from './views/rececipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import bookmarkView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addrecipeView from './views/addrecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';

// Parcel function
if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////
// Control Area
///////////////

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();
    // 0) Update results view to marked selected search results
    resultView.update(model.getSearchResultsPage());
    // 3) Update bookmark
    bookmarkView.update(model.state.bookmarks);

    // 1) Loading recipe
    // loadRecipe is async function, which will return a promise
    // Thus we use await
    await model.loadRecipe(id);
    // const { recipe } = model.state;

    // 2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResult = async function () {
  try {
    resultView.renderSpinner();
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    // resultView.render(model.state.search.result);
    resultView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 3) Render NEW results
  // resultView.render(model.state.search.result);
  resultView.render(model.getSearchResultsPage(goToPage));

  // 4) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe serving
  model.updateServings(newServings);
  // Update the servingView
  // Method 1 Update all
  // recipeView.render(model.state.recipe);
  // Method 2 Update part
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  // 1) Add or remove a bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmark = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = function () {
  // render new recipe
  addrecipeView.renderwithoutData();
};

const controlAddRecipeSubmit = async function (newRecipe) {
  try {
    // show spinner
    addrecipeView.renderSpinner();

    //  1) Upload new recipe
    await model.uploadRecipe(newRecipe);

    // Async function 'uploadRecipe' must have await function
    // to catch the error

    // 2) render recipe
    recipeView.render(model.state.recipe);

    // Success Message
    addrecipeView.renderMessage();

    // Render bookmark view
    bookmarkView.render(model.state.bookmarks);

    // Change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window (Optional)
    // setTimeout(function () {
    //   addrecipeView.toggleWindow();
    // }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('🐔', err);
    addrecipeView.renderError(err.message);
  }
};

///////////////
// Function  Area
///////////////

const init = function () {
  bookmarkView.addHandlerRender(controlBookmark);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookMark);
  searchView.addHanderSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addrecipeView.addHandlerUpload(controlAddRecipeSubmit);
  addrecipeView.addHandlerShowWindow(controlAddRecipe);
  // controlServings();
  // The recipe has bee loaded yet . It will show undefined
};
init();
