var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const createError = require('http-errors')


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

// router.get("/test", async (req, res, next) => {
//     console.log("+++++++++++++++++++++++++")
//     console.log(req.body.id)
// });

router.get(`/randomRecipes`, async (req, res, next) => {
    try {
        const recipe = await axios.get(`${api_domain}/random`, {
            params: {
                number: 3,
                apiKey: process.env.spooncular_apiKey
            }
        });
        console.log("-------------------------------------------------------------------------------------------------------------------------------------------");
        console.log(recipe.data);
        console.log("-------------------------------------------------------------------------------------------------------------------------------------------");
        var recipeArray = recipe.data["recipes"];
        console.log("coucou");
        console.log("rec id: " + recipeArray[0].id + "  rec title: "+ recipeArray[0].title);
        console.log("rec id: " + recipeArray[1].id + "  rec title: "+ recipeArray[1].title);
        console.log("rec id: " + recipeArray[2].id + "  rec title: "+ recipeArray[2].title);
        //console.log("rec info:: " + recipeArray[0].params.toString());

        //var recipeMeta2 = getRecipeInfo(recipeArray[1].id);
        //var recipeMeta3 = getRecipeInfo(recipeArray[2].id);

        var recipeMeta1 = getRecipeInfo(recipeArray[0].id);
        var recipeMeta2 = getRecipeInfo(recipeArray[1].id);
        var recipeMeta3 = getRecipeInfo(recipeArray[2].id);
        var random_response =
            {
                "Random Recipe 1" : recipeMeta1,
                "Random Recipe 2" : recipeMeta2,
                "Random Recipe 3" : recipeMeta3,
            };
        res.status(770).send(random_response);

    } catch (error) {
        next(error);
    }
});

/*router.get('/3RandomRecipes', async (req, res, next) => {
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
});*/
//#endregion

/*function getRecipeInfo(recipes){
  return {
    "Id": recipes["recipe_id"],
    "Picture": recipes["imageURL"],
    "Name": recipes["recipe_name"]
  }
}*/

function getRecipeInfo(id) {
  return axios.get(`${api_domain}/${id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey
    }
  });
}

async function addToRecipeFavorite(id,username,type,next,res) {
  try{

    var myFavoriteRecipe;
    pool = await poolPromise
    result = await pool.request()
        .query(`select * from profile where username =  '${username}'`,async function(err, profile){
          if (err){
            next(err)
          }

          if(profile.recordset.length === 0){
            next(createError('404','non exists profile !! '))
          }

          //check if the recipe is alreadi saved in the favorites
          if(profile.recordset[0].myFavoriteRecipe.length===0)
              myFavoriteRecipe=[]
          else
              myFavoriteRecipe=JSON.parse(profile.recordset[0].favoriteRecipe)

          NotExistsrecipe = myFavoriteRecipe.some(recId => {
            return recId.id===id
          })

          if(!NotExistsrecipe){
            //Check if the recipe is user or spoon api recipe
            let newFavorite={'id':id, 'type': type }
              myFavoriteRecipe.push(newFavorite)
            await pool.request()
                .query(`update profile set favoriteRecipe = '${JSON.stringify(myFavoriteRecipe)}' where username =  '${username}'`,function(err, user){
                  return res.status(200).json({message: 'new favorite recipe have succesfuly added to table', sucess:'true'})
                })
          }
          else
            next(createError(400,'error - this recipe is already exists'))
        })
  }
  catch(err){
    next(err)
  }
}


module.exports = router;
