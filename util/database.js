require('dotenv').config();

const Sequelize = require('sequelize');

DB_NAME = process.env.DB_NAME;
DB_USERNAME = process.env.DB_USERNAME;
DB_PASSWORD = process.env.DB_PASSWORD;
DB_DIALECT = process.env.DB_DIALECT;
DB_HOST = process.env.DB_HOST

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    dialect: DB_DIALECT,
    host: DB_HOST
})

module.exports = sequelize;