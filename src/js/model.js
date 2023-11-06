import { async } from 'regenerator-runtime';
// import { getJSON, sendJSON } from './helper.js';
import { AJAX } from './helper.js';
import { API_URL, RES_PER_PAGE, KEY } from './config';

export const state = {
  recipe: {},
  search: {
    query: '',
    result: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return (
    // BUG
    // state.recipe = {
    {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      image: recipe.image_url,
      serving: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
      sourceUrl: recipe.source_url,
      // Add property key if recipe.key exist
      ...(recipe.key && { key: recipe.key }),
    }
    // }
  );
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
    console.log('--BG---loadRecipe-----');
    console.log(state.recipe);
    console.log('--ED---loadRecipe-----');
  } catch (err) {
    console.error(`${err} in model`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log('--BG---KEY-----');
    console.log(`${API_URL}?search=${query}&key=${KEY}`);
    console.log('--ED---KEY-----');

    state.search.result = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        sourceUrl: rec.source_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} in model`);
    throw err;
  }
  // finally {
  //   model.state.search.page = 1;
  // }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = state.search.resultsPerPage * page;
  return state.search.result.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (newServings / state.recipe.serving) * ing.quantity;
  });
  state.recipe.serving = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  //  1) Add bookmark
  state.bookmarks.push(recipe);

  //  2) Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // console.log('--BG---bookmarks-----');
  // console.log(state.bookmarks);
  // console.log('--ED---bookmarks-----');
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

export const uploadRecipe = async function (newRecipe) {
  try {
    console.log(Object.entries(newRecipe));

    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        console.log(ingArr);
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format ~ Please use the correct format'
          );
        const [quantity, unit, description] = ingArr;
        return {
          quantity: quantity ? Number(quantity) : null,
          unit,
          description,
        };
      });
    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      image_url: newRecipe.image,
      servings: Number(newRecipe.servings),
      cooking_time: +newRecipe.cookingTime,
      ingredients,
      source_url: newRecipe.sourceUrl,
    };
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe); // Add property bookmarked
  } catch (err) {
    throw err;
  }
};
