var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const bcrypt = require("bcrypt");
const api_domain = "https://api.spoonacular.com/recipes";
const axios = require("axios");

/*
{
	"username": "samuel"
}
*/
router.get("/personalRecipes", async function (req, res) {
    try {
        const username = req.body.username;
        const personal_recipes = await DButils.execQuery(`SELECT recipe_id,recipe_name,imageURL,timePreparation,vegan,vegeterian,freeGluten FROM recipes where author='${username}'`);
        let result = [];
        personal_recipes.forEach(recipe => {
            result.push({
                recipe_id: recipe.recipe_id,
                recipe_name: recipe.recipe_name,
                imageURL: recipe.imageURL,
                timePreparation: recipe.timePreparation,
                vegan: recipe.vegan,
                vegetarian: recipe.vegetarian,
                freeGluten: recipe.freeGluten
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
            name: recipe.recipe_name,
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
router.get("/lastWatchedRecipes", async (req, res, next) => {
    try {
        const username = req.session.username;
        if (username == undefined) {
            res.status(401).send("User need to be connected");
        } else {
            const lastWatchedRecipes = (
                await DButils.execQuery(
                    `SELECT TOP 3 idRecipe FROM watched WHERE username = '${username}' ORDER BY lastModify DESC`
                )
            );
            let result = [];
            for (let i = 0;i < lastWatchedRecipes.length; i++){
                result.push(lastWatchedRecipes[i])
            }
            res.status(200).json(result);
        }
    } catch (error) {
        next(error);
    }
});



module.exports = router;
