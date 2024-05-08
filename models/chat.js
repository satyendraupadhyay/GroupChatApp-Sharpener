const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user'); // Import the User model if not already imported

const Chat = sequelize.define('chats', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: { // Define the userId column
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Assuming the name of the users table is 'users'
            key: 'id'
        }
    }
});

// Define the association between Chat and User models
Chat.belongsTo(User, { foreignKey: 'userId' }); // Assuming each chat belongs to a user

module.exports = Chat;
