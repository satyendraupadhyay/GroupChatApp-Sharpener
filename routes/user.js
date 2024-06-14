const express = require('express');

const authentication = require('../middleware/auth');
const userController = require('../controllers/user');

const router = express.Router();

router.get('/groups', authentication.authenticateUser, userController.getUserGroups);

router.get('/user', authentication.authenticateUser, userController.getUsers);

router.post('/createGroup', authentication.authenticateUser,userController.postCreateGroup);

module.exports = router;