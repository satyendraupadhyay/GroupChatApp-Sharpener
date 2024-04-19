const path = require('path');
const User = require('../models/user');
const bcrypt = require('bcrypt');

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
    const { name, email, password, phone } = req.body;
    console.log(req.body);
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
        console.log(err);
        const data = await User.create({name: name, email: email, password: hash, phone: phone });
        res.status(201).json({success: true , newData: data});
    })
}