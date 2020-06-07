var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const bcrypt = require("bcrypt");
const api_domain = "https://api.spoonacular.com/recipes";

router.get("/personalRecipes", async function (req, res) {
  try {
    const username = req.query.username;
    const personal_recipes = await DButils.execQuery(`SELECT recipe_id,recipe_name,imageURL,timePreparation,vegan,vegeterian,freeGluten FROM recipes where author='${username}'`);
    let result=[];
    personal_recipes.forEach(recipe => {
      result.push({
        recipe_id:recipe.recipe_id,
        recipe_name:recipe.recipe_name,
        imageURL:recipe.imageURL,
        timePreparation:recipe.timePreparation,
        vegan:recipe.vegan,
        vegetarian:recipe.vegetarian,
        freeGluten:recipe.freeGluten
      });
    });
    res.send(result);
  }
  catch (error) {
    next(error);
  }
});

router.get("/familyRecipes", async (req,res)=>{
  const username = req.query.username;
  let familyRecipes = await DButils.execQuery(`SELECT recipe_id,recipe_name,imageURL,familyMember,occasion,preparation from familyRecipes where username='${username}'`);
  let result = [];
  familyRecipes.forEach(recipe => {
    result.push({
      recipe_id:recipe.recipe_id,
      recipe_name:recipe.recipe_name,
      imageURL:recipe.imageURL,
      familyMember:recipe.familyMember,
      occasion:recipe.occasion,
      preparation:recipe.preparation
    });
  });
  res.status(200).send(result);
})



module.exports = router;
