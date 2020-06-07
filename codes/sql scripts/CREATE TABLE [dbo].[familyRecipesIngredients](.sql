CREATE TABLE [dbo].[familyRecipesIngredients](
    [recipe_id] [UNIQUEIDENTIFIER] not null foreign key references familyRecipes([recipe_id]),
    ingredient_name [varchar](300) not null,
    [amount] [numeric] not null ,
    [unit] [varchar](300) not null ,
    primary key ([recipe_id],[ingredient_name]),
)

