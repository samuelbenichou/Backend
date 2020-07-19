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

router.get("/test", async (req, res, next) => {
  console.log("+++++++++++++++++++++++++")
  console.log(req.body.id)
});


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

router.put('/addToMyFavorite',async function(req,res,next){
  try{
    const username = req.body.username;
    const recipeId = req.body.recipeId;
    query = "";
    const isRecipeExist =  await DButils.execQuery(`SELECT isFavorite FROM profiles where username='${username}' and recipeId='${recipeId}' `);

    if(isRecipeExist.length == 0){
      // console.log("")
      // console.log("no record - insert new one")
      query=`insert into profiles (username,recipeId,isFavorite,isWatched) VALUES('${username}','${recipeId}',1,0)`;
      await DButils.execQuery(query);
    }
    else if ( isRecipeExist.length != 0 && isRecipeExist[0].isFavorite!=1){
      // console.log("")
      // console.log("record exist - update as favorite")
      query=`UPDATE profiles set isFavorite='1' where recipeId='${recipeId}' and username='${username}'`;
      await DButils.execQuery(query);
    }
    else{
      throw { status: 400, message: "The recipe have already signed as favorite" };
    }

    res.status(201).send({ message: "new recipe has added to the user favorites"});
  }
  catch(error){
    next(error);
  }
})


router.get("/getMyfavourite/:user_name", async function (req, res, next) {
  try
  {
    const username= req.params.user_name;
    const favoriteResSetIDS = await DButils.execQuery(`SELECT recipeId FROM profiles where username='${username}' and isFavorite=1`);
    let favoriteSet=[];
    for (const id of favoriteResSetIDS) {
      let recipe= await spooncular.recipePreviewInfo(id.recipeId);
      console.log("----------------------id: "+ recipe.id)
      console.log("----------------------title: "+ recipe.title)
      favoriteSet.push(recipe);
    }
    console.log("+++++++++++++----------------------------------------------")
    console.log(favoriteSet)
    console.log("-+++++++++++---------------------------------------------")
    res.status(200).send(favoriteSet);
  } catch (error) {
    next(error);
  }

});



module.exports = router;
