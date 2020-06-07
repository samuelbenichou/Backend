var express = require("express");
var router = express.Router();

const DButils = require("../../modules/DButils");
const { poolConnect } = require("../../modules/DButils");
const {check, validationResult} = require('express-validator')
const recipesActions = require('../../solution/routes/recipes')
const auth = require('../../solution/routes/auth');

const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const createError = require('http-errors')
const spooncular = require("../../modules/spoonacular_actions");
/////////////////////////////////////////////////////////////////////////////////

// router.use(function requireLogin(req, res, next) {
//   if (!req.user_id) {
//     next({ status: 401, message: "unauthorized" });
//   } else {
//     next();
//   }
// });

// router.get("/test", async (req, res, next) => {
//   console.log("+++++++++++++++++++++++++")
//   console.log(req.body.id)
// });


//#region global simple
// router.use((req, res, next) => {
//   const { cookie } = req.body;

//   if (cookie && cookie.valid) {
//     DButils.execQuery("SELECT username FROM users")
//       .then((users) => {
//         if (users.find((e) => e.username === cookie.username))
//           req.username = cookie.username;
//         next();
//       })
//       .catch((err) => next(err));
//   } else {
//     next();
//   }
// });
//#endregion

router.get("/favorites", function (req, res) {
  //console.log("++++++++++++++++++++++++++++++");/////////////////////////////
  res.send(req.originalUrl);
});

router.get("/personalRecipes", function (req, res) {
  res.send(req.originalUrl);
});

//#region example2 - make add Recipe endpoint

//#region complex
// router.use("/addPersonalRecipe", function (req, res, next) {
//   if (req.session && req.session.user_id) {
//     // or findOne Stored Procedure
//     DButils.execQuery("SELECT user_id FROM users").then((users) => {
//       if (users.find((x) => x.user_id === req.session.user_id)) {
//         req.user_id = user_id;
//         // req.session.user_id = user_id; //refresh the session value
//         // res.locals.user_id = user_id;
//         next();
//       } else throw { status: 401, message: "unauthorized" };
//     });
//   } else {
//     throw { status: 401, message: "unauthorized" };
//   }
// });
//#endregion

//#region simple
// router.use("/addPersonalRecipe", (req, res, next) => {
//   const { cookie } = req.body; // but the request was GET so how come we have req.body???
//   if (cookie && cookie.valid) {
//     req.username = cookie.username;
//     next();
//   } else throw { status: 401, message: "unauthorized" };
// });
//#endregion

router.post("/addPersonalRecipe", async (req, res, next) => {
  //console.log("++++++++++++++++++++++++++++++ enter");/////////////////////////////
  try {
    await DButils.execQuery(
      `INSERT INTO recipes VALUES (default, '${req.user_id}', '${req.body.recipe_name}')`
    );
    res.send({ sucess: true, cookie_valid: req.username && 1 });
  } catch (error) {
    next(error);
  }
});
//#endregion



//@route PUT/api/favorite
//@update new favorite recipe to table

router.put('/favorite',async function(req,res,next){
  console.log("++++++++++++++++++++++++++++++ enter");/////////////////////////////
  try{
    //check that input is  not null
    console.log("-------------------------------   1");/////////////////////////////
    // console.log(req.body);/////////////////////////////
    const error = validationResult(req)
    if(!error.isEmpty())
      return res.status(400).json({ errors: error.array() });

    const {recipe_id} = req.body.recipe_id;//////////////////////////////////////////////////??? .id
    pool = await poolConnect
    console.log("-------------------------------   2");/////////////////////////////
    result = await pool.request()
        .query(`select * from recipes where recipe_id =  '${recipe_id}'`,async function(err, user){
          if (err)
            return next(err)
          //Check if the recipe is from user

          console.log("-------------------------------   3");/////////////////////////////
          if(user.recordset.length !== 0){
            console.log("-------------------------------   4");/////////////////////////////
            recipesActions.addToRecipeFavorite(id,req.user,'user',next,res)
          }
          else
          {
            //Check if the recipe is from API
            try{
              //let exists= await recipes_actions.getRecipeInfo(id)
              console.log("-------------------------------   5");/////////////////////////////
              recipesActions.addToRecipeFavorite(id,req.user,'spooncalur',next,res)
            }
            catch(err) {
              next(err)
            }
          }
        })
  }
  catch(error){
    next(error);
  }
})


router.get("/favorites", async function (req, res) {
  try
  {
    const username= req.username;

    const favoriteResSetIDS = await DButils.execQuery(`SELECT recipeId FROM profiles where username='${username}' and isFavorite=1`);
    let favoriteSet=[];
    for (const id of favoriteResSetIDS) {
      let recipe= await spooncular.recipePreviewData(id.recipeId);
      favoriteSet.push(recipe);
    }

    res.send(favoriteSet);
  } catch (error) {
    next(error);
  }

});

module.exports = router;
