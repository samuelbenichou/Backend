var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const bcrypt = require("bcrypt");
const api_domain = "https://api.spoonacular.com/recipes";
const axios = require("axios");

router.post("/Register", async (req, res, next) => {
    try {
        // parameters exists
        // valid parameters
        // username exists
        let userInfo = {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.firstName,
            contry: req.body.contry,
            password: req.body.password,
            email: req.body.email,
            profilePic: req.body.profilePic
        }

        const users = await DButils.execQuery("SELECT username FROM users");

        if (users.find((x) => x.username === userInfo.username))
            throw {status: 409, message: "Username taken"};

        // add the new username
        let hash_password = bcrypt.hashSync(
            req.body.password,
            parseInt(process.env.bcrypt_saltRounds)
        );
        await DButils.execQuery(
            `INSERT INTO users VALUES (default, '${userInfo.username}', '${userInfo.firstName}', '${userInfo.lastName}', '${userInfo.contry}', '${hash_password}', '${userInfo.email}', '${userInfo.profilePic}')`
        );
        res.status(201).send({message: "user created", success: true});
    } catch (error) {
        next(error);
    }
});

router.post("/Login", async (req, res, next) => {
    try {
        // check that username exists
        const users = await DButils.execQuery("SELECT username FROM users");
        if (!users.find((x) => x.username === req.body.username))
            throw {status: 401, message: "Username or Password incorrect"};

        // check that the password is correct
        const user = (
            await DButils.execQuery(
                `SELECT * FROM users WHERE username = '${req.body.username}'`
            )
        )[0];

        if (!bcrypt.compareSync(req.body.password, user.password)) {
            throw {status: 401, message: "Username or Password incorrect"};
        }

        // Set cookie
        req.session.username = user.username;
        console.log(req.session.username)
        // req.session.save();
        // res.cookie(session_options.cookieName, user.user_id, cookies_options);

        // return cookie
        res.status(200).send({message: "login succeeded", success: true});
    } catch (error) {
        next(error);
    }
});

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

router.get("/familyRecipes", async (req, res) => {
    const username = req.body.username;
    let familyRecipes = await DButils.execQuery(`SELECT recipe_id,recipe_name,imageURL,familyMember,occasion,preparation from familyRecipes where username='${username}'`);
    let result = [];
    familyRecipes.forEach(recipe => {
        result.push({
            recipe_id: recipe.recipe_id,
            recipe_name: recipe.recipe_name,
            imageURL: recipe.imageURL,
            familyMember: recipe.familyMember,
            occasion: recipe.occasion,
            preparation: recipe.preparation,
            ingredients: recipe.ingredients
        });
    });
    res.status(200).send(result);
})


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
        res.status(770).send(random_response);

    } catch (error) {
        next(error);
    }
});

router.get('/recipeID', async (req, res, next) => {
    try {
        let recipe = (await DButils.execQuery(`SELECT * FROM PersonalRecipes WHERE recipe_id = '${req.body.recipe_id}'`))
        if (recipe.length === 0) {
            res.status(401).send("no recipe found");
        } else {
            res.status(200).send(recipe);
        }
    } catch (error) {
        next(error)
    }
});

function getRecipeData(rawData) {
    var recipeData =
        {
            "Id": rawData["id"],
            "Picture": rawData["image"],
            "Name": rawData["title"]
        };
    return recipeData
}

router.get("/lastWatchedRecipes", async (req, res, next) => {
    try {
        console.log(req.session.username)
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


router.get('/recipe/:recipe_id', async (req, res, next) => {
    try{
        let recipe = (await DButils.execQuery(`SELECT * FROM recipes WHERE recipe_id = '${req.body.recipe_id}'`))
        res.status(200).send(recipe);
    }
    catch(error){
        next(error)
    }
});


module.exports = router;
