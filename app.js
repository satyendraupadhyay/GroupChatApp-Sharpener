const path = require('path');
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const PORT = process.env.PORT;

const bodyParser = require('body-parser');

const homeRoutes = require('./routes/home');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');
// Util
const sequelize = require('./util/database');
// Models
const Chat = require('./models/chat');
const User = require('./models/user');
const Group = require('./models/group');
const Admin = require('./models/admin');
const { log } = require('console');

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use(homeRoutes);
app.use(`/user`, userRoutes);
app.use(chatRoutes);
app.use(groupRoutes);

// User -> Chat : one to many
User.hasMany(Chat);
Chat.belongsTo(User);

// Group -> Chat: one to many
Group.hasMany(Chat);
Chat.belongsTo(Group);

// User -> Admin : one to many
User.hasMany(Admin);
Admin.belongsTo(User);

// Group -> Admin : one to many
Group.hasMany(Admin);
Admin.belongsTo(Group);

// User -> Group: many to many
User.belongsToMany(Group, { through: 'User_Group', foreignKey: 'userId' });
Group.belongsToMany(User, { through: 'User_Group', foreignKey: 'groupId' });

sequelize.sync()
.then((result) => app.listen(PORT || 3000))
.catch((error) => console.log(error));