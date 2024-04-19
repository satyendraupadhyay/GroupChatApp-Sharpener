const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.post('/signup', userController.postSignup);
router.get('/signup', userController.getSignup);
router.get('/check', userController.checkSignup);

module.exports = router;