CREATE TABLE [dbo].[familyRecipes](
    [recipe_id] [UNIQUEIDENTIFIER] NOT NULL default NEWID() primary key ,
    [username] [varchar](50) NOT NULL ,
    [recipe_name] [varchar](300) NOT NULL,
    [imageURL] [varchar] (300) NOT NULL,
    [familyMember] [varchar] (300) NOT NULL,
    [occasion] [varchar] (300) NOT NULL,
    [preparation] [varchar] (300) NOT NULL,
    PRIMARY KEY (recipe_id)
    FOREIGN KEY (username) REFERENCES users(username)
)

