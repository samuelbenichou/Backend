var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const axios = require("axios");

const api_domain = "https://api.spoonacular.com/recipes";

router.post("/AddRecipe", async (req, res, next) => {
  try {

    // parameters exists
    // valid parameters
    // username exists
    let recipeInfo = {
      author: req.body.user_id,
      recipe_name: req.body.recipe_name,
      imageURL: req.body.imageURL,
      timePreparation: req.body.timePreparation,
      vegan: req.body.vegan,
      vegeterian: req.body.vegeterian,
      freeGluten: req.body.freeGluten,
      servings: req.body.servings
    }
    const user_id = req.session.user_id;
    await DButils.execQuery(
        `INSERT INTO recipes VALUES (default,'${user_id}' , '${recipeInfo.recipe_name}', '${recipeInfo.imageURL}', '${recipeInfo.timePreparation}', '${recipeInfo.vegan}', '${recipeInfo.vegeterian}', '${recipeInfo.freeGluten}', '${recipeInfo.servings}')`
    );
    res.status(201).send({ message: "recipe created", success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/", (req, res) => res.send("im here"));

router.get("/Information", async (req, res, next) => {
  try {
    const recipe = await getRecipeInfo(req.query.recipe_id);
    res.send({ data: recipe.data });
  } catch (error) {
    next(error);
  }
});

router.get('/randomRecipes', async (req, res, next) => {
  const valid_recipes = [];
  const num_recipes_to_ask=3;
  const valid_recipes_returned = await getValidRecipe(num_recipes_to_ask, valid_recipes);
  let info_array = extractRelventRandomRecipesData(valid_recipes_returned);
  res.status(200).send(info_array);
})

//#region example1 - make serach endpoint
router.get("/search", async (req, res, next) => {
  try {
    const { query, cuisine, diet, intolerances, number } = req.query;
    const search_response = await axios.get(`${api_domain}/search`, {
      params: {
        query: query,
        cuisine: cuisine,
        diet: diet,
        intolerances: intolerances,
        number: number,
        instructionsRequired: true,
        apiKey: process.env.spooncular_apiKey
      }
    });
    let recipes = await Promise.all(
      search_response.data.results.map((recipe_raw) =>
        getRecipeInfo(recipe_raw.id)
      )
    );
    recipes = recipes.map((recipe) => recipe.data);
    res.send({ data: recipes });
  } catch (error) {
    next(error);
  }
});
//#endregion

function getRecipeInfo(id) {
  return axios.get(`${api_domain}/${id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey
    }
  });
}

async function getValidRecipe(recipes_number, valid_recipes){
  search_params ={};
  search_params.number = recipes_number;
  await axios.get(
      `${api_domain}/random?apiKey=${process.env.spooncular_apiKey}`,
      {
        params: search_params,
      }
  ).then(async (search_respone) => {
    const valid_recipes_returned = checkRecipeValidation(search_respone, valid_recipes);
    if (valid_recipes.length<3) {
      console.log("Here")
      await getValidRecipe(3-valid_recipes.length, valid_recipes);
      return valid_recipes;
    } else {
      return valid_recipes;
    }
  });
}

function extractRelventRandomRecipesData(recipes_info){
  return recipes_info.map((recipes_info) => searchUtils.extractRelventRecipeData(recipes_info))
}

module.exports = router;
