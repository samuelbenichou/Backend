var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const createError = require('http-errors')
const spooncular = require("../../modules/spoonacular_actions");

/*router.post("/AddRecipe", async (req, res, next) => {
  try {

    // parameters exists
    // valid parameters
    // username exists
    let recipeInfo = {
      author: req.body.username,
      recipe_name: req.body.recipe_name,
      imageURL: req.body.imageURL,
      timePreparation: req.body.timePreparation,
      vegan: req.body.vegan,
      vegeterian: req.body.vegeterian,
      freeGluten: req.body.freeGluten,
      servings: req.body.servings
    }
    await DButils.execQuery(
        `INSERT INTO recipes VALUES (default,'${recipeInfo.username}' , '${recipeInfo.recipe_name}', '${recipeInfo.imageURL}', '${recipeInfo.timePreparation}', '${recipeInfo.vegan}', '${recipeInfo.vegeterian}', '${recipeInfo.freeGluten}', '${recipeInfo.servings}')`
    );
    res.status(201).send({ message: "recipe created", success: true });
  } catch (error) {
    next(error);
  }
});*/


//router.get("/", (req, res) => res.send("im here"));
router.get("/Information", async (req, res, next) => {
  try {
    //const recipe = await getRecipeInfo(req.query);
    const recipe = await getRecipeInfo(req.query);
    res.status(200).send({ data: recipe.data });
    // res.status(200).send(recipe.data );

  } catch (error) {
    next(error);
  }
});


/*
    Send an empty request post via postman
*/
router.get("/randomRecipes", async (req, res, next) => {
    try {
        console.log("enter random")
        const recipe = await axios.get(`${api_domain}/random`, {
            params: {
                number: 3,
                apiKey: process.env.spooncular_apiKey
            }
        });
        var recipeArray = recipe.data["recipes"];
        var randomRecipe1 = getRecipeData(recipeArray[0]);
        var randomRecipe2 = getRecipeData(recipeArray[1]);
        var randomRecipe3 = getRecipeData(recipeArray[2]);
        console.log("all info:"+ randomRecipe3.id);
        var random_response =
            [
                randomRecipe1,
                randomRecipe2,
                randomRecipe3,
            ];
        res.status(200).send(random_response);

    } catch (error) {
        next(error);
    }
});

function getRecipeData(rawData) {
    //console.log("rawData: "+rawData)
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


function getRecipeInfo(id) {
  return axios.get(`${api_domain}/${id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey
    }
  });
}


//search recipes in spooncular AIP by name and categories
// {
//     "recipesNameSearch": "Cabbage and sausages in beer",
//     "numberOfRecipes": "0",
//     "cuisine": "",
//     "diet": "",
//     "intolerance": ""
// }
router.get("/searchRecipes", async (req, res, next) => {
    try {
        const cuisine = req.body.cuisine ;
        const diet = req.body.diet ;
        const intolerance = req.body.intolerance ;
        const recipesNameSearch = req.body.recipesNameSearch ;
        let numberOfRecipes = req.body.numberOfRecipes ;
        // console.log("cuisine: "+ cuisine);
        // console.log("diet: "+ diet);
        // console.log("intolerance: "+ intolerance);
        // console.log("recipesNameSearch: "+ recipesNameSearch);
        // console.log("numberOfRecipes: "+ numberOfRecipes);
        //res.status(204).send({message:"No recipes found for the inserted query"});
        if(numberOfRecipes<=0){
            numberOfRecipes =5;
        }
        const searchResults =await spooncular.searchRecipes(recipesNameSearch,cuisine,diet,intolerance,numberOfRecipes);
        //console.log("---------------------------------------1");
        let recipesData = await Promise.all(
            searchResults.data.results.map((recipe_raw) =>
                spooncular.recipePreviewInfo(recipe_raw.id)
            )
        );
        //console.log("---------------------------------------2");
        if(recipesData.length>0)
            res.status(200).send(recipesData);
        else
        {
            res.status(204).send({message:"No recipes found for the inserted query"});
        }
    } catch (error) {
        next(error);
    }
});




//get list of recipes idS and return list of recipes frop spooncular API
// {
//     "idsArr": [ 716297, 716301, 716423],
//     "username": "liorB"
// }
router.get("/recipies/recipiesIdsApi", async (req, res, next) => {
    try {
        const recipeIds  = req.body.idsArr;
        const username  = req.body.username;
        let recipesArr=new Array();
        let recipesData ;

        for (const id of recipeIds) {
            recipesData=  await spooncular.recipePreviewInfo(id )
            recipesArr.push(recipesData);
        }
        //console.log("all data: "+recipesData[0]);
        if (recipesArr.length > 0) {
            for (const recipe of recipesArr) {
                let cuerentRecipe = recipe.id;
                const lastWatchedRecipes = (
                    await DButils.execQuery(
                        `SELECT * FROM watched WHERE idRecipe='${cuerentRecipe}' and username='${username}'`
                    )
                );

                let currentTime = getCurrentTimeDate();
                if( lastWatchedRecipes.length!=1 ){
                    query=`insert into watched (username,idRecipe,lastModify) VALUES('${username}','${cuerentRecipe}' ,'${currentTime}' )`;
                    await DButils.execQuery(query);
                }
                // else{
                //     query=`UPDATE watched set lastModify=currentTime where idRecipe='${cuerentRecipe}' and username='${username}'`;
                //     await DButils.execQuery(query);
                // }

            }
        }

        if(recipesArr.length>0)
            res.status(200).send(recipesArr);
        else
        {
            res.status(204).send({message:"No recipes found for the inserted query"});
        }
    }
    catch (error) {
        next(error);
    }
});

//return specific recipe from  users local recipes
// {
//     "recipeId": "555A4802-1330-4B40-A58F-B6BE6F49AF51"
// }
router.get("/recipes/recipeId", async function(req,res,next){
    try {
        const recipeId =req.body.recipeId;
        console.log("recipeId: "+ recipeId)
        let recipeData  = await DButils.execQuery(`SELECT * FROM recipes where recipe_id='${recipeId}'`);
        res.status(200).send( recipeData );
    }
    catch (err) {
        next(err);
    }
});


//get list of recipes idS and return list of recipes from the database
// {
//     "idsArr": [ "555A4802-1330-4B40-A58F-B6BE6F49AF51", "657A4802-1330-4B40-A58F-B6BE6F49AF51", "8082A10C-34AE-4869-8CA2-88E21D76962E"]
// }
router.get("/recipies/recipiesIdsDatabase", async (req, res, next) => {
    try {
        const recipeIds  = req.body.idsArr;
        const username  = req.body.username;
        let recipesArr=new Array();
        let recipesData ;

        for (const recipe_id of recipeIds) {
            recipesData  = await DButils.execQuery(`SELECT * FROM recipes where recipe_id='${recipe_id}'`);
            recipesArr.push(recipesData);

        }

        if(recipesArr.length>0)
            res.status(200).send(recipesArr);
        else
        {
            res.status(204).send({message:"No recipes found for the inserted query"});
        }
    }
    catch (error) {
        next(error);
    }
});

function getCurrentTimeDate() {
    let dateTime = new Date();
    let month = dateTime.getMonth()+1;
    let year = dateTime.getFullYear();
    let date = dateTime.getDate();
    let hour = dateTime.getHours();
    let minute = dateTime.getMinutes()
    let seconds = dateTime.getSeconds()
    let currentTime = ""+ month+"-"+date+"-"+year+"  "+hour+":"+minute+":"+seconds;
    //console.log("currentTime: "+currentTime);
    return currentTime;
}

//get list of recipes idS and return list of recipes frop spooncular API
// {
//     "idsArr": [ 716297, 716301, 716423],
//     "username": "liorB"
// }
// router.get("/recipies/information/:recipeId/:username", async (req, res, next) => {

router.get("/recipies/information/:recipeId/:username", async (req, res, next) => {
    try {
        const recipeId  = req.params.recipeId;
        const username  = req.params.username;
        console.log("recipeId "+recipeId);
        console.log("username "+ username);
        let recipesData ;
        recipesData=  await spooncular.recipePreviewInfo( recipeId )
        console.log("recipesData:::: "+ recipesData.instructions);
        console.log("recipesData:::: "+ recipesData.servings);
        console.log("recipesData:::: "+ recipesData.extendedIngredients[0].aisle
            +"  "+recipesData.extendedIngredients[0].amount);
        if (recipesData.length > 0){
            let cuerentRecipe = recipeId;
            const lastWatchedRecipes = (
                await DButils.execQuery(
                    `SELECT * FROM watched WHERE idRecipe='${cuerentRecipe}' and username='${username}'`
                )
            );
            let currentTime = getCurrentTimeDate();
            if( lastWatchedRecipes.length!=1 ){
                query=`insert into watched (username,idRecipe,lastModify) VALUES('${username}','${cuerentRecipe}' ,'${currentTime}' )`;
                await DButils.execQuery(query);
            }
        }
        res.status(200).send(recipesData);
    }
    catch (error) {
        next(error);
    }
});

module.exports = router;
