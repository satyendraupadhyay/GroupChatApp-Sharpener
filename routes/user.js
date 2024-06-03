const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.get('/groups', userController.getUserGroups);

router.post('/createGroup', userController.postCreateGroup);

module.exports = router;