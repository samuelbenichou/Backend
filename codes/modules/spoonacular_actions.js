const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

async function recipePreviewInfo(recipeId) {
    //console.log("-----------------------2.1  id: "+recipeId)
    recipeinfo = await axios.get(`${api_domain}/${recipeId}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
    const{id,title,readyInMinutes,aggregateLikes,vegetarian,vegan,glutenFree,image} = recipeinfo.data;
    //console.log("-----------------------2.2  id: "+recipeinfo.data.title)
    return {
        id:id,
        title:title,
        readyInMinutes:readyInMinutes,
        aggregateLikes:aggregateLikes,
        vegetarian:vegetarian,
        vegan:vegan,
        glutenFree:glutenFree,
        image:image,
    };

}

async function searchRecipes(recipesNameSearch,cuisine,diet,intolerance,numberOfRecipes)
{
    const searchResults = await axios.get(`${api_domain}/search`, {
        params: {
            query: recipesNameSearch,
            cuisine: cuisine,
            diet: diet,
            intolerance: intolerance,
            number: numberOfRecipes,
            instructionsRequired: true,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return searchResults;
}

exports.searchRecipes=searchRecipes;
exports.recipePreviewInfo=recipePreviewInfo;
