CREATE TABLE [dbo].[users](
    [user_id] [Integer] PRIMARY KEY NOT NULL default NEWID(),
    [username] [varchar](30) NOT NULL UNIQUE,
    [fname] [varchar](30) NOT NULL,
    [lname] [varchar](30) NOT NULL,
    [contry] [varchar](30) NOT NULL,
    [password] [varchar](300) NOT NULL,
    [email] [varchar](30) NOT NULL,
    [profilePic] [varchar](300) NOT NULL
)

