'use strict';

const recipeContainer = document.querySelector('.recipe');
const searchBtn = document.getElementById('search__btn');
const searchField = document.getElementById('search__field');
const results = document.getElementById('results');
const pagination = document.getElementById('pagination');
const spinner = document.getElementById('spinner');
const previousBtn = document.getElementById('previousBtn');
const nextBtn = document.getElementById('nextBtn');
const message = document.getElementById('message');
const recipeSpinner = document.getElementById('recipeSpinner');

const fullRecipeContainer = document.getElementById('recipeContainer');
const recipeImg = document.getElementById('recipeImg');
const recipeName = document.getElementById('recipeName');
const cookingtime = document.getElementById('cookingtime');
const serving = document.getElementById('serving');
const recipeIngredientList = document.getElementById('recipeIngredientList');
const recipePublisher = document.getElementById('recipePublisher');
const recipeLink = document.getElementById('recipeLink');

const increaseServing = document.getElementById('increaseServing');
const descreaseServing = document.getElementById('descreaseServing');

const bookmarkBtn = document.getElementById('bookmarkBtn');
const bookmarkContainer = document.getElementById('bookmarksList');
const bookmarkMsg = document.getElementById('bookmarkMsg');
const bmIcon = document.getElementById('bookmarkIcon');

const suggestionResult = document.getElementById('suggestionResult');

let recipeList = null;
let ingredientsQuantity = null;
let previous = 0;
let next = 10;
let servingPeople = null;
let bookmarkList = {};
let recipeNameList = null;
const localStgdata = localStorage.getItem('bookmarks');

// bookmark logic
const recipeBookmark = function (id, imgSrc, recipeName, publisher) {
  bookmarkMsg.classList.add('hide');
  const recipe = `
                <li class="preview bookmarkItem">
                  <a class="preview__link" href="#${id}">
                    <figure class="preview__fig">
                      <img src="${imgSrc}" alt="Test" />
                    </figure>
                    <div class="preview__data">
                      <h4 class="preview__title">
                        ${recipeName}
                      </h4>
                      <p class="preview__publisher">${publisher}</p>
                    </div>
                  </a>
                </li>
  `;
  bookmarkContainer.insertAdjacentHTML('beforeend', recipe);
};

// getting data from localstorage for bookmark, if exist
if (localStgdata) {
  bookmarkList = JSON.parse(localStgdata);
  Object.keys(bookmarkList).forEach(obj => {
    recipeBookmark(
      bookmarkList[obj].id,
      bookmarkList[obj].img_url,
      bookmarkList[obj].recipeName,
      bookmarkList[obj].publisher
    );
  });
}

// it will create one ingredient list and append to recipeIngredientList div
const createRecipeIngredient = function (quantity = '', unit = '', name = '') {
  const ingredient = `
              <li class="recipe__ingredient">
                <svg class="recipe__icon">
                  <use href="src/img/icons.svg#icon-check"></use>
                </svg>
                <div class="recipe__quantity">${
                  quantity === null ? '' : quantity
                }</div>
                <div class="recipe__description">
                  <span class="recipe__unit">${unit === null ? '' : unit}</span>
                  ${name}
                </div>
              </li>
  `;
  recipeIngredientList.insertAdjacentHTML('beforeend', ingredient);
};

// it set the number on pagination button
const setPaginationBtnText = function (pre, next) {
  previousBtn.getElementsByTagName('span')[0].innerText = `Page ${pre / 10}`;
  nextBtn.getElementsByTagName('span')[0].innerText = `Page ${
    (next + 10) / 10
  }`;
};

// render 10 recipes at a time
const renderRecipeList = function (previous, next) {
  const recipeList10 = recipeList.slice(previous, next);
  results.innerHTML = '';
  recipeList10.forEach(recipeObj => {
    createRecipeCard(
      recipeObj.title,
      recipeObj.publisher,
      recipeObj.image_url,
      recipeObj.id
    );
  });
};

// message to display when no recipe is found
const errorMessage = function (msg) {
  const errorMsg = `
          <div class="error">
            <div>
              <svg>
                <use href="src/img/icons.svg#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${msg}</p>
          </div>
  `;
  results.insertAdjacentHTML('beforeend', errorMsg);
};

// api is to get only recipe name with some info and it return array of objects
const getRecipeName = async function (recipeName) {
  const controller = new AbortController();
  spinner.classList.remove('hide');
  results.innerHTML = '';
  const signal = controller.signal;

  setTimeout(() => {
    controller.abort();
  }, 5000);
  try {
    const recipeResponse = await fetch(
      `https://forkify-api.herokuapp.com/api/v2/recipes?search=${recipeName}`,
      { signal }
    );
    const recipe = await recipeResponse.json();

    return recipe.data.recipes;
  } catch (e) {
    throw new Error('Request took too long! Try again!');
  }
};

// api call to get full recipe for select recipe card and it return the recipe object
const getFullRecipe = async function (recipeId) {
  const recipeResponse = await fetch(
    `https://forkify-api.herokuapp.com/api/v2/recipes/${recipeId}`
  );
  const { data } = await recipeResponse.json();
  return data;
};

// it create recipe listing card with provided value and append to results div
const createRecipeCard = function (
  title = 'No Name',
  publisher = '',
  imgSrc,
  recipeId
) {
  const card = `
          <li class="preview">
            <a class="preview__link" href="#${recipeId}">
              <figure class="preview__fig">
                <img src="${imgSrc}" alt="Test" />
              </figure>
              <div class="preview__data">
                <h4 class="preview__title">${title}</h4>
                <p class="preview__publisher">${publisher}</p>
                <!-- <div class="preview__user-generated">
                   <svg>
                    <use href="src/img/icons.svg#icon-user"></use>
                  </svg> 
                </div> -->
              </div>
            </a>
          </li>
  `;

  results.insertAdjacentHTML('beforeend', card);
};

const listRecipes = function (searchTerm) {
  const regex = /^\s*$/;

  // if input field is blank, it return immediately
  if (regex.test(searchTerm)) return;

  getRecipeName(searchTerm)
    .then(data => {
      spinner.classList.add('hide');
      results.innerHTML = '';
      if (data.length === 0) {
        errorMessage('No recipes found for your query. Please try again!');
        return;
      } else if (data.length > 10) {
        pagination.classList.remove('hide');
      }

      recipeList = data;
      nextBtn.getElementsByTagName('span')[0].innerText = 'Page 2';

      renderRecipeList(previous, next);
    })
    .catch(error => {
      spinner.classList.add('hide');
      errorMessage(error.message);
    });
};

// when search button clicked
// it fetch recipe name with input word and call getRecipeName
searchBtn.addEventListener('click', function (e) {
  e.preventDefault();
  const searchTerm = searchField.value;
  listRecipes(searchTerm);
});

const getFullRecipeById = function (recipeId) {
  bmIcon.href.baseVal = 'src/img/icons.svg#icon-bookmark';
  fullRecipeContainer.classList.add('hide');
  message.classList.add('hide');
  recipeSpinner.classList.remove('hide');

  // it will check click recipe is in bookmark or not
  // if it is bookmark then it will highlight bookmark button as bookmarked
  if (Object.keys(bookmarkList).includes(recipeId))
    bmIcon.href.baseVal = 'src/img/icons.svg#icon-bookmark-fill';

  getFullRecipe(recipeId).then(fullrecipe => {
    fullRecipeContainer.classList.remove('hide');
    recipeSpinner.classList.add('hide');
    recipeImg.src = fullrecipe.recipe.image_url;
    recipeName.innerText = fullrecipe.recipe.title;
    cookingtime.innerText = fullrecipe.recipe.cooking_time;
    serving.innerText = fullrecipe.recipe.servings;
    servingPeople = fullrecipe.recipe.servings;
    recipePublisher.innerText = fullrecipe.recipe.publisher;
    recipeLink.href = fullrecipe.recipe.source_url;

    fullrecipe.recipe.ingredients.forEach(el => {
      createRecipeIngredient(el.quantity, el.unit, el.description);
    });

    ingredientsQuantity = fullrecipe.recipe.ingredients.map(el => {
      if (!(el.quantity == null)) {
        return el.quantity / 4;
      } else {
        return null;
      }
    });
  });
};

// detecting which recipe card is clicked
// rendering that recipe with full information
results.addEventListener('click', function (e) {
  if (e.target.closest('.preview')) {
    const recipeId = e.target
      .closest('.preview')
      .getElementsByTagName('a')[0]
      .href.split('#');

    getFullRecipeById(recipeId[1]);
  }
});

// pagination next button logic
nextBtn.addEventListener('click', function () {
  previous = next;
  next += 10;
  previousBtn.classList.remove('hide');

  if (next >= recipeList.length) {
    nextBtn.classList.add('hide');
  }

  setPaginationBtnText(previous, next);
  renderRecipeList(previous, next);
});

// pagination previous button logic
previousBtn.addEventListener('click', function () {
  previous -= 10;
  next -= 10;

  nextBtn.classList.remove('hide');

  if (previous <= 0) {
    previousBtn.classList.add('hide');
  }

  setPaginationBtnText(previous, next);
  renderRecipeList(previous, next);
});

// updating ingredients value, according to serving increase or descrease
const updateIngredientValue = function (serve) {
  serving.innerText = serve;
  const recipeQuantity = document.querySelectorAll('.recipe__quantity');
  recipeQuantity.forEach((el, index) => {
    if (ingredientsQuantity[index])
      el.innerText = ingredientsQuantity[index] * servingPeople;
  });
};

// updating ingredient value when serving people increases
increaseServing.addEventListener('click', function () {
  servingPeople += 1;
  updateIngredientValue(servingPeople);
});

// updating ingredient value when serving people descreases
descreaseServing.addEventListener('click', function () {
  if (servingPeople > 0) servingPeople -= 1;
  updateIngredientValue(servingPeople);
});

// handling bookmark of recipe on bookmark button click
// and again bookmark button click to remove bookmark from list
bookmarkBtn.addEventListener('click', function () {
  const bookmarkObj = {};
  if (bmIcon.href.baseVal.includes('fill')) {
    bmIcon.href.baseVal = 'src/img/icons.svg#icon-bookmark';
    const currentRecipe = window.location.href.split('#')[1];
    document.querySelectorAll('.bookmarkItem').forEach(el => {
      if (
        el.getElementsByTagName('a')[0].href.split('#')[1] === currentRecipe
      ) {
        delete bookmarkList[window.location.href.split('#')[1]];
        el.remove();
        localStorage.setItem('bookmarks', JSON.stringify(bookmarkList));
      }
    });
    if (bookmarkContainer.children.length === 1) {
      bookmarkMsg.classList.remove('hide');
    }
  } else {
    bmIcon.href.baseVal = 'src/img/icons.svg#icon-bookmark-fill';
    bookmarkObj.id = window.location.href.split('#')[1];
    bookmarkObj.img_url = recipeImg.src;
    bookmarkObj.recipeName = recipeName.innerText;
    bookmarkObj.publisher = recipePublisher.innerText;

    bookmarkList[bookmarkObj.id] = bookmarkObj;

    recipeBookmark(
      bookmarkObj.id,
      bookmarkObj.img_url,
      bookmarkObj.recipeName,
      bookmarkObj.publisher
    );

    localStorage.setItem('bookmarks', JSON.stringify(bookmarkList));
  }
});

bookmarkContainer.addEventListener('click', function (e) {
  const bmRecipeUrl = e.target
    .closest('.bookmarkItem')
    .getElementsByTagName('a')[0]
    .href.split('#')[1];

  getFullRecipeById(bmRecipeUrl);
});

window.addEventListener('load', function () {
  fetch('https://forkify-api.herokuapp.com/phrases.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const listArr = doc.querySelectorAll('li');
      recipeNameList = Array.from(listArr).map(el => el.innerText);
      recipeNameList.sort();
    })
    .catch(err => console.error('Error:', err));
});

// handling suggestion
searchField.addEventListener('input', function () {
  suggestionResult.innerText = '';
  const userInputs = searchField.value.trim().toLowerCase();
  let result = null;
  if (userInputs) {
    result = recipeNameList.filter(word => word.startsWith(userInputs));
    result.forEach((word, i) => {
      if (i < 10)
        suggestionResult.insertAdjacentHTML('beforeend', `<li>${word}</li>`);
      else return;
    });
  }
});

suggestionResult.addEventListener('click', function (e) {
  searchField.value = e.target.innerText;
  listRecipes(e.target.innerText);
  suggestionResult.innerText = '';
});

// it will hide suggestion result when clicked outside
document.querySelector('body').addEventListener('click', function (e) {
  if (e.target !== searchField) suggestionResult.innerText = '';
});
