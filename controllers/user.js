const path = require('path');
const users = require('../models/user');
const bcrypt = require('bcrypt');

exports.getSignup = (req, res, next) => {
    res.sendFile(path.join(__dirname, '..' , 'views', 'signup.html'));
}

exports.postSignup = (req, res, next) => {
    const { name, email, password, phone } = req.body;
    console.log(req.body);
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
        console.log(err);
        const data = await users.create({name: name, email: email, password: hash, phone: phone });
        res.status(201).json({success: true , newData: data});
    })

}