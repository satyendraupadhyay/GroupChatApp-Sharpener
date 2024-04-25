const express = require('express');

const homeController = require('../controllers/home');

const router = express.Router();

router.get('/home', homeController.getHomepage);
router.get('/chat', homeController.getChatpage);

router.post('/signup', homeController.postSignup);
router.get('/signup', homeController.getSignup);
router.get('/check', homeController.checkSignup);

router.post('/signin', homeController.postSignin);
router.get('/signin', homeController.getSignin);

module.exports = router;