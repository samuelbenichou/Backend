const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

async function recipePreviewInfo(recipeId) {
    recipeinfo = await axios.get(`${api_domain}/${recipeId}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
    const{id,title,readyInMinutes,aggregateLikes,vegetarian,vegan,glutenFree,image} = recipeinfo.data;
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

exports.recipePreviewInfo=recipePreviewInfo;
