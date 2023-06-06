const mysql = require("mysql2");
require("dotenv").config();
//const config = require("../config");
// import { createPool } from "mysql2";
// import { HOST, USER, PASSWORD, PORT_DB, DATABASE } from "../config";

// export const pool = createPool({
//   host: HOST,
//   user: USER,
//   password: PASSWORD,
//   port: PORT_DB,
//   database: DATABASE,
// });

const conection = mysql.createConnection({
  database: process.env.DATABASE,
  user: process.env.USER,
  host: process.env.HOST,
  password: process.env.PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

conection.connect((error) => {
  if (error) {
    console.log("Error al conectar a la base de datos " + error);
    return;
  }
  console.log("Conexion exitosa a la DB");
});

module.exports = conection;
