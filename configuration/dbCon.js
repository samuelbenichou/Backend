
require("dotenv").config();
const sqlCon = require("mssql")

//  if connection goes through it will try to connect and execute queries
const MyPoolPromise = new sqlCon.ConnectionPool(config).connect().then(pool => {
        console.log('MSSQL connection succeeded')
        return pool
    })
    .catch(err => console.log('Failed to connect to database! wrong Configuration: ', err))
    module.exports = {
    sqlCon, poolPromise
}

// Create connection to database
const Configuration = {
    user: process.env.tedious_userName,
    password: process.env.tedious_password,
    server: process.env.tedious_server,
    database: process.env.tedious_database,
    options: {
        "encrypt": true,
        "enableArithAbort": true
    },
};



