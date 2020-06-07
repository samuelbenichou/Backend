var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const poolConnect = require("../../modules/DButils");

const {check, validationResult} = require('express-validator')
const recipesActions = require('../../solution/routes/recipes')
const auth = require('../../solution/routes/auth');


router.use(function requireLogin(req, res, next) {
  if (!req.user_id) {
    next({ status: 401, message: "unauthorized" });
  } else {
    next();
  }
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
//  router.put('/favorite',auth,[check('id', 'must be not empty').not().isEmpty()],async function(req,res,next){
router.put('/favorite',async function(req,res,next){
  console.log("++++++++++++++++++++++++++++++");/////////////////////////////
  try{
    //check that input is  not null
    console.log("-------------------------------");/////////////////////////////
    console.log(req.body.id);/////////////////////////////
    const error = validationResult(req)
    if(!error.isEmpty())
      return res.status(400).json({ errors: error.array() });

    const {id} = req.body.id;//////////////////////////////////////////////////??? .id
    pool = await MyPoolPromise
    result = await pool.request()
        .query(`select * from recipes where id =  '${id}'`,async function(err, user){
          if (err)
            return next(err)
          //Check if the recipe is from user


          if(user.recordset.length !== 0)
            recipesActions.addToRecipeFavorite(id,req.user,'user',next,res)
          else
          {
            //Check if the recipe is from API
            try{
              //let exists= await recipes_actions.getRecipeInfo(id)
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


module.exports = router;
