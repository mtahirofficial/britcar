require('dotenv').config("../.env");

module.exports = {
  "username": process.env.DBUSER,
  "password": process.env.PASSWORD,
  "database": process.env.DATABASE,
  "host": process.env.DBHOST,
  "dialect": "mysql"
}