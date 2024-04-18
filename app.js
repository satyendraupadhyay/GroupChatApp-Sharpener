const path = require('path');
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const PORT = process.env.PORT;

const bodyParser = require('body-parser');

const userRoutes = require('./routes/user');
const sequelize = require('./util/database');
const { log } = require('console');

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use('/user', userRoutes);

async function initiate() {
try{
    await sequelize.sync();
    app.listen(PORT, () => {
        console.log(`Server started at ${PORT}`);
    })
}
catch(error) {
    console.log(error);
}
}
initiate();