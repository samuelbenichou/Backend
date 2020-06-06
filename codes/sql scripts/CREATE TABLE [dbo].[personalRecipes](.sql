CREATE TABLE [dbo].[personalRecipes](
	[id] [UNIQUEIDENTIFIER] NOT NULL default NEWID(),
	[recipeName] [varchar](300) NOT NULL,
	[timePreparation] [integer] NOT NULL,
	[imageUrl] [varchar] (300) NOT NULL,
	[likes] [integer] NOT NULL,
	[vegetarian] [bit] NOT NULL,
	[vegan] [bit] NOT NULL,
	[freeGluten] [bit]  NOT NULL,
)

