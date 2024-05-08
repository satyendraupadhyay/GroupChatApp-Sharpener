const path = require('path');
require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

exports.getHomepage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
};

exports.getChatpage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'chat.html'));
};


function generateAccessToken(user) {
    return jwt.sign({userId: user.id, username: user.username, email: user.email}, process.env.JWT_SECRET_KEY);
}

// Signup
exports.getSignup = (req, res, next) => {
    res.sendFile(path.join(__dirname, '..' , 'views', 'signup.html'));
}

exports.checkSignup = async (req, res, next) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.postSignup = (req, res, next) => {
    const { username, email, password, phone } = req.body;
    console.log(req.body);
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
        console.log(err);
        const data = await User.create({username: username, email: email, password: hash, phone: phone });
        res.status(201).json({success: true , newData: data});
    })
}

// Signin
exports.getSignin = (req, res, next) => {
    res.sendFile(path.join(__dirname, '..' , 'views', 'signin.html'));
}

exports.postSignin = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        res.status(400).json({ msg: 'All fields are required' });
        return;
    }

    try {
        const user = await User.findOne({ where: { email: email } });
        if(!user){
            res.status(404).json({ msg: 'Email not registered' });
            return;
        }
            const hash = user.password;
            const match = await bcrypt.compare(password, hash);
            if (match) {
                res.status(200).json({ success: true, message: "User logged in successfully", token: generateAccessToken(user)});
                return;
            } else {
                res.status(401).json({ success: false, message: "Password is incorrect" });
            }
    } catch(err){
        console.log('POST USER LOGIN ERROR');
        res.status(404).json({ error: err, msg: 'Could not fetch user' });
    }
};