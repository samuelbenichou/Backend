var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const bcrypt = require("bcrypt");

const { MyPoolPromise } = require("../../modules/DButils");

/*
{
  "username": "sam",
  "password": "sam",
  "firstName": "sam",
  "lastName": "Benichou",
  "country": "France",
  "email": "benichos@post.bgu.ac.il",
  "profilePicture": "https://res.cloudinary.com"
}
 */
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

/* Enter username and password
   {
    "username": "samuelb11",
    "password": "1234"
    }
 */
router.post("/Login/:user_name", async (req, res, next) => {
    try {
        // check that username exists
        const users = await DButils.execQuery("SELECT username FROM users");
        if (!users.find((x) => x.username === req.params.user_name))
            throw { status: 401, message: "Username or Password incorrect" };

        // check that the password is correct
        const user = (
            await DButils.execQuery(
                `SELECT * FROM users WHERE username = '${req.body.username}'`
            )
        )[0];

        if (!bcrypt.compareSync(req.body.password, user.password)) {
            throw { status: 401, message: "Username or Password incorrect" };
        }

        // Set cookie
        req.session.username = user.username;
        // req.session.save();
        // res.cookie(session_options.cookieName, user.user_id, cookies_options);

        // return cookie
        res.status(200).send({ message: "login succeeded", success: true });
    } catch (error) {
        next(error);
    }
});

/*
 Send an empty post via postman
 */
router.post("/Logout", function (req, res) {
    req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
    res.send({ success: true, message: "logout succeeded" });
});

module.exports = async (req,res,next) => {
    //Check if seassion exists
    if( !(req.session && req.session.userId) ){
        return res.status(401).json({msg: 'Session not exists, authorization denied'});
    }

    var pool = await MyPoolPromise
    var result = await pool.request()
        .query(`select * from users where username =  '${req.session.userId}'`,function(err, user){
            if (err) {
                return res.status(401).json({msg: err});
            }
            if(!user)
            {
                return res.status(401).json({msg: 'Session not exists, authorization denied'});
            }

            user.password= undefined;
            req.user = req.session.userId;
            //Access user variable in any html templates
            res.locals.user = user;

            next();
        });
}

module.exports = router;
