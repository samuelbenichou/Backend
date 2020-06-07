require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.tedious_userName,
  password: process.env.tedious_password,
  server: process.env.tedious_server,
  database: process.env.tedious_database,
  //connectionTimeout: 1500000,
  options: {
    "encrypt": true,
    "enableArithAbort": true
  },
};

// const pool = new sqlCon.ConnectionPool(config).connect().then(pool => {
//   console.log('MSSQL connection succeeded')
//   return pool
//   })
//     .catch(err => console.log('Failed to connect to database! wrong Configuration: ', err))
// module.exports = {
//   sqlCon, poolPromise
// }

const poolConnect = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      console.log('new connection pool Created')
      return pool
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err))
module.exports = {
  sql, poolConnect
}

exports.execQuery = async function (query) {
  await poolConnect;
  try {
    var result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};
// process.on("SIGINT", function () {
//   if (pool) {
//     pool.close(() => console.log("connection pool closed"));
//   }
// });

// poolConnect.then(() => {
//   console.log("pool closed");

//   return sql.close();
// });

// exports.execQuery = function (query) {
//   return new Promise((resolve, reject) => {
//     sql
//       .connect(config)
//       .then((pool) => {
//         return pool.request().query(query);
//       })
//       .then((result) => {
//         // console.log(result);
//         sql.close();
//         resolve(result.recordsets[0]);
//       })
//       .catch((err) => {
//         // ... error checks
//       });
//   });
// };
