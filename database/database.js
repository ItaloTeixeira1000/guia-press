const Sequelize = require("sequelize");

const connection = new Sequelize("guiapress", "root", "senha mysql", {
    host: "localhost",
    dialect: "mysql",
    timezone: "-03:00"
});

module.exports = connection;