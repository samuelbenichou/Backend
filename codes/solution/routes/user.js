var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const bcrypt = require("bcrypt");
const api_domain = "https://api.spoonacular.com/recipes";
const axios = require("axios");
const spooncular = require("../../modules/spoonacular_actions");

/*
{
	"username": "samuel"
}
*/
router.get("/personalRecipes/:user_name", async function (req, res) {
    try {
        const username= req.params.user_name;
        const personal_recipes = await DButils.execQuery(`SELECT recipe_id,recipe_name,imageURL,timePreparation,vegan,vegeterian,freeGluten FROM recipes where author='${username}'`);
        let result = [];
        personal_recipes.forEach(recipe => {
            result.push({
                id: recipe.recipe_id,
                title: recipe.recipe_name,
                image: recipe.imageURL,
                readyInMinutes: recipe.timePreparation,
                vegan: recipe.vegan,
                vegetarian: recipe.vegetarian,
                glutenFree: recipe.freeGluten
            });
        });
        res.send(result);
    } catch (error) {
        next(error);
    }
});


/*
{
	"username": "liorB"
}
*/
router.get("/familyRecipes/:user_name", async (req, res) => {
    const username= req.params.user_name;
    let familyRecipes = await DButils.execQuery(`SELECT recipe_id,recipe_name,imageURL,familyMember,occasion,preparation from familyRecipes where username='${username}'`);
    let result = [];
    familyRecipes.forEach(recipe => {
        result.push({
            id: recipe.recipe_id,
            title: recipe.recipe_name,
            image: recipe.imageURL,
            familyMember: recipe.familyMember,
            occasion: recipe.occasion,
            preparation: recipe.preparation,
            ingredients: recipe.ingredients
        });
    });
    res.status(200).send(result);
})

/*
    First you need to login .
    Send an empty request post via postman
 */
router.get("/lastWatchedRecipes/:user_name", async (req, res, next) => {

    try {
        const username= req.params.user_name;
        if (username == undefined) {
            res.status(401).send("User need to be connected");
        } else {
            //console.log("1111111111111111111111111111");
            const lastWatchedRecipes = (
                await DButils.execQuery(
                    `SELECT TOP 3 idRecipe FROM watched WHERE username = '${username}' ORDER BY lastModify DESC`
                )
            );
            let result = [];

            //console.log("2222222222222222222222");
            for (const id of lastWatchedRecipes){
                //console.log("----------------------id: "+ id.idRecipe)
                let recipe= await spooncular.recipePreviewInfo(id.idRecipe);
                //console.log("----------------------id: "+ recipe.id)
                //console.log("----------------------title: "+ recipe.title)
                console.log("----------------------all info: "+ recipe)
                result.push(recipe);
            }
            //console.log("3333333333333333333333");
            res.status(200).json(result);
        }
    } catch (error) {
        next(error);
    }
});

function getRecipeData(rawData) {
    var recipeData =
        {

            "id": rawData["id"],
            "title": rawData["title"],
            "image": rawData["image"],
            "readyInMinutes": rawData["readyInMinutes"],
            "aggregateLikes": rawData["aggregateLikes"],
            "vegetarian": rawData["vegetarian"],
            "vegan": rawData["vegan"],
            "glutenFree": rawData["glutenFree"],
        };
    return recipeData
}


module.exports = router;
