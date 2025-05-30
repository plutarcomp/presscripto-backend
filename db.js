require('dotenv').config();
const pgp = require('pg-promise')();

const connection = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

const db = pgp(connection);

module.exports = db;