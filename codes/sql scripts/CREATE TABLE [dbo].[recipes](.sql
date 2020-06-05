CREATE TABLE [dbo].[recipes](
	[recipe_id] [UNIQUEIDENTIFIER] NOT NULL default NEWID(),
	[author] [UNIQUEIDENTIFIER] NOT NULL,
	[recipe_name] [varchar](300) NOT NULL,
	[imageURL] [varchar](500) NOT NULL,
	[timePreparation] [int] NOT NULL,
	[vegan] [int] NOT NULL,
	[vegeterian] [int] NOT NULL,
	[freeGluten] [int] NOT NULL,
	[servings] [int] NOT NULL,
	PRIMARY KEY (author, recipe_name),
	FOREIGN KEY (author) REFERENCES users(user_id)
)

