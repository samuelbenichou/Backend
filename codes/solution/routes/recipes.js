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
    res.send({ data: recipe.data });
  } catch (error) {
    next(error);
  }
});


/*
    Send an empty request post via postman
*/
router.get("/randomRecipes", async (req, res, next) => {
    try {
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
        var random_response =
            {
                "Random Recipe 1": randomRecipe1,
                "Random Recipe 2": randomRecipe2,
                "Random Recipe 3": randomRecipe3,
            };
        res.status(200).send(random_response);

    } catch (error) {
        next(error);
    }
});

function getRecipeData(rawData) {
    var recipeData =
        {
            "Id": rawData["id"],
            "Name": rawData["title"],
            "Recipe Picture": rawData["image"]
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
//
// async function addToRecipeFavorite(id,username,type,next,res) {
//   try{
//
//     var myFavoriteRecipe;
//     pool = await poolPromise
//     result = await pool.request()
//         .query(`select * from profile where username =  '${username}'`,async function(err, profile){
//           if (err){
//             next(err)
//           }
//
//           if(profile.recordset.length === 0){
//             next(createError('404','non exists profile !! '))
//           }
//
//           //check if the recipe is alreadi saved in the favorites
//           if(profile.recordset[0].myFavoriteRecipe.length===0)
//               myFavoriteRecipe=[]
//           else
//               myFavoriteRecipe=JSON.parse(profile.recordset[0].favoriteRecipe)
//
//           NotExistsrecipe = myFavoriteRecipe.some(recId => {
//             return recId.id===id
//           })
//
//           if(!NotExistsrecipe){
//             //Check if the recipe is user or spoon api recipe
//             let newFavorite={'id':id, 'type': type }
//               myFavoriteRecipe.push(newFavorite)
//             await pool.request()
//                 .query(`update profile set favoriteRecipe = '${JSON.stringify(myFavoriteRecipe)}' where username =  '${username}'`,function(err, user){
//                   return res.status(200).json({message: 'new favorite recipe have succesfuly added to table', sucess:'true'})
//                 })
//           }
//           else
//             next(createError(400,'error - this recipe is already exists'))
//         })
//   }
//   catch(err){
//     next(err)
//   }
// }

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
//     "idsArr": [ 716297, 716301, 716423]
// }
router.get("/recipies/recipiesIdsApi", async (req, res, next) => {
    try {
        const recipeIds  = req.body.idsArr;
        let recipesArr=new Array();
        let recipesData ;

        for (const id of recipeIds) {
            recipesData=  await spooncular.recipePreviewInfo(id )
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
module.exports = router;
