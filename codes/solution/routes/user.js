var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const bcrypt = require("bcrypt");
const api_domain = "https://api.spoonacular.com/recipes";

router.get("/personalRecipes", async function (req, res) {
  try {
    const aaa = req.firstName;
    const username = req.username;
    console.log(aaa);
    const personal_recipes = await DButils.execQuery(`SELECT recipe_id,recipe_name,imageURL,timePreparation,vegan,vegeterian,freeGluten FROM recipes where author='${username}'`);

    let toSend=[];

    personal_recipes.forEach(recipe => {
      toSend.push({
        recipe_id:recipe.recipe_id,
        recipe_name:recipe.recipe_name,
        imageURL:recipe.imageURL,
        timePreparation:recipe.timePreparation,
        vegan:recipe.vegan,
        vegetarian:recipe.vegetarian,
        freeGluten:recipe.freeGluten
      });
    });

    res.send(toSend);
  }
  catch (error) {
    next(error);
  }

});



module.exports = router;
