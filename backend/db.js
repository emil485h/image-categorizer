// backend/db.js
const { Sequelize } = require("sequelize");

// Replace these values with your actual database connection details
const sequelize = new Sequelize("MariaDB", "Nextcloud", "Qdp44fyd", {
  host: "192.168.0.61",
  dialect: "mariadb",
  port: 3308, // or your custom port if different
});

const Image = sequelize.define("Image", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  filename: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  categories: {
    type: Sequelize.JSON,
    allowNull: false,
  },
});

sequelize.sync();

module.exports = { sequelize, Image };
