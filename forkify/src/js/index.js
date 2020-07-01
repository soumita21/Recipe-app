import Search from './models/Search';
import List from './models/List';
import * as searchView from './views/searchView';
import * as likesView from './views/likesView';
import * as listView from './views/listView';
import * as recipeView from './views/recipeView';
import Recipe from './models/Recipe';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';
// Global st. 
// search obj , current recipe obj,shopping list obj , liked recipe 
const state = {};
window.state = state;

//Search controller

const controlsearch = async() => {
    //get query
    const query = searchView.getInput();
    if (query) {
        //new search obj and add to st
        state.search = new Search(query);

        //prepear UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //search recipes and parse ingredients
            await state.search.getResults();

            //render results on ui
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert("Some error");
            clearLoader();

        }
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlsearch();
});

// //TEST
// window.addEventListener('load', e => {
//     e.preventDefault();
//     controlsearch();
// });

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);

        console.log(goToPage);
    }
});



//Recipe controller

const controlRecipe = async() => {
    const id = window.location.hash.replace('#', '');
    console.log(id);
    if (id) {
        //ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight 
        if (state.search) searchView.highlightSelected(id);
        //create new recipe obj
        state.recipe = new Recipe(id);
        //  window.r = state.recipe;

        try {

            //get recipe dataa
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calc serving and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err) {
            console.log(err);
            alert("error processing recipe");
        }
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load',controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//LIST CONTROLLER
const controlList = () => {
    //create new list if not
    if (!state.list) state.list = new List();
    //add ingredient to the list and ui
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//handle delete and update list
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //delete button
    if (e.target.matches('.shopping__delete,.shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);

        //delete from ui
        listView.deleteItem(id);

        //handle update
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
});


//LIKE CONTROLLER

//test
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());


const controlLike = () => {
    if (!state.like) state.likes = new Likes();
    const currentID = state.recipe.id;

    //user not yet liked
    if (!state.likes.isLiked(currentID)) {
        //add like to state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //toggle the like button
        likesView.toggleLikeBtn(true);
        //add like to ui list
        likesView.renderLike(newLike);
        console.log(state.likes);
        // Liked current recipe    
    } else {
        //Remove like from state
        state.like.deleteLike(currentID);

        //toggle the likes button
        likesView.toggleLikeBtn(false);

        //Removelike from ui list
        likesView.deleteLike(currentID);
        console.log(state.likes);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};



//handling recipe button clicks

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //decrease btn
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love', '.recipe__love *')) {
        //like controller
        controlLike();

    }
    //    console.log(state.recipe);
});

window.l = new List();